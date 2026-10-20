const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, plain, cursor, uuid } = require('../interviews/history-test-helpers.cjs')
const { NextResponse } = require('next/server')
const setup = load('lib/interviews/interview-setup-input.ts', {})
const config = { interviewerKey:'f', role:'Engineer', company:'Example', level:'mid', interviewType:'technical', persona:'formal', language:'en' }
const question = () => ({ operation:'question', config:{...config}, ordinal:1, priorQuestions:[] })
const feedback = () => ({ operation:'feedback', config:{...config}, question:'Q?', answer:'Answer' })
const evaluation = () => ({ operation:'evaluation', config:{...config}, answers:[{q:'Q?',a:'Answer'}] })
const voice = () => ({ text:'Question?', voiceId:'EXAVITQu4vr4xnSDxMaL' })
const PRIVATE = 'PRIVATE_CONTENT_SENTINEL'
const SECRET = 'TOKEN_SECRET_SENTINEL'
const tick = async () => { for (let i=0;i<30;i++) await Promise.resolve() }
const deferred = () => { let resolve; const promise=new Promise(r=>{resolve=r});return {promise,resolve} }
const textResult = text => Response.json({content:[{type:'text',text}]})
const audioResult = () => new Response(new Uint8Array([255,251,144,0,0,0,0,0]), {headers:{'content-type':'audio/mpeg'}})

function harness(options={}) {
  const calls=[], logs=[], authCalls=[], timers=new Map()
  let timerId=0, cookie=options.cookie ?? null, bearer=options.bearer ?? null
  let upstream=options.upstream ?? (()=>textResult('Question?'))
  const globals={Response,Request,Headers,ReadableStream,Uint8Array,TextDecoder,AbortController,
    console:{log:(...v)=>logs.push(v),warn:(...v)=>logs.push(v),error:(...v)=>logs.push(v)},
    process:{env:{ANTHROPIC_API_KEY:SECRET,ELEVENLABS_API_KEY:SECRET}},
    setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)},
    async fetch(url,init){calls.push({url,init});return upstream(url,init)},
  }
  const auth=load('lib/auth/get-authenticated-user.ts',{'server-only':{},'@/lib/supabase/server':{createClient:()=>({auth:{
    async getUser(token){authCalls.push(token);if(options.authThrow)throw Error(PRIVATE+SECRET);const id=token===undefined?cookie:(token===SECRET?bearer:null);return {data:{user:id?{id}:null},error:id?null:{message:PRIVATE+SECRET}}},
  }})}},globals)
  const boundary=load('lib/providers/provider-boundary.ts',{'server-only':{}},globals)
  const contract=load('lib/providers/claude-contract.ts',{'@/lib/interviews/interview-setup-input':setup,'@/lib/providers/provider-boundary':boundary},globals)
  const imports={'@/lib/auth/get-authenticated-user':auth,'@/lib/providers/provider-boundary':boundary,'@/lib/providers/claude-contract':contract}
  const claude=load('app/api/claude/route.ts',imports,globals)
  const eleven=load('app/api/elevenlabs/route.ts',imports,globals)
  const heygen=load('app/api/heygen-token/route.ts',{},globals)
  function request(body,authorization,raw=false){return new Request('http://test.local/api',{method:'POST',headers:authorization===undefined?{}:{authorization},body:raw?body:JSON.stringify(body)})}
  function privacy(responseText=''){assert.ok(!responseText.includes(PRIVATE));assert.ok(!responseText.includes(SECRET));assert.ok(!JSON.stringify(logs).includes(PRIVATE));assert.ok(!JSON.stringify(logs).includes(SECRET))}
  return {calls,logs,authCalls,timers,boundary,contract,auth,heygen,request,privacy,
    setIdentity(c,b){cookie=c;bearer=b},setUpstream(fn){upstream=fn},
    post(body=question(),authorization,raw=false){return claude.POST(request(body,authorization,raw))},
    tts(body=voice(),authorization,raw=false){return eleven.POST(request(body,authorization,raw))},
    fire(ms){const found=[...timers].find(([,t])=>t.ms===ms);assert.ok(found,'expected timeout '+ms);timers.delete(found[0]);found[1].fn()},
  }
}

for (const [name,cookie,bearer,header,status] of [
  ['neither',null,null,undefined,401],['cookie only','user-a',null,undefined,200],
  ['bearer only',null,'user-a','Bearer '+SECRET,200],['invalid bearer',null,null,'Bearer '+SECRET,401],
  ['valid cookie invalid bearer','user-a',null,'Bearer '+SECRET,401],
  ['same user','user-a','user-a','Bearer '+SECRET,200],['conflict','user-a','user-b','Bearer '+SECRET,401],
  ['empty explicit header','user-a',null,'',401],['wrong scheme','user-a',null,'Basic '+SECRET,401],
  ['malformed bearer','user-a','user-a','Bearer '+SECRET+' extra',401],
]) test('auth: '+name+' for both paid routes',async()=>{
  const h=harness({cookie,bearer})
  assert.equal((await h.post(question(),header)).status,status)
  h.setUpstream(audioResult)
  assert.equal((await h.tts(voice(),header)).status,status)
  assert.equal(h.calls.length,status===200?2:0)
  if(bearer&&status===200)assert.ok(h.authCalls.includes(SECRET))
  h.privacy()
})
test('cookie-only server callers remain supported; auth exceptions fail closed',async()=>{
  const h=harness({cookie:'web'});assert.equal((await h.auth.getAuthenticatedUser()).user.id,'web')
  const bad=harness({cookie:'web',authThrow:true});const response=await bad.post();assert.equal(response.status,401);assert.equal(bad.calls.length,0);bad.privacy(await response.text())
})
test('completion ownership derives from verified bearer, not caller ID',async()=>{
  const h=harness({bearer:'verified-owner'}), owners=[]
  const route=load('app/api/interviews/route.ts',{
    'next/server':{NextResponse},'@/lib/auth/get-authenticated-user':h.auth,
    '@/lib/supabase/admin':{createAdminClient(){throw Error('unexpected database call')}},
    '@/lib/interviews/history-cursor':cursor,'@/lib/interviews/interview-setup-input':setup,
    '@/lib/interviews/interview-completion-state':load('lib/interviews/interview-completion-state.ts',{}),
    '@/lib/interviews/persist-owned-interview':{async persistOwnedInterview(owner,id){owners.push(owner);return {status:'saved',id,replayed:false}}},
  })
  const payload={...config,completionId:uuid(1),answers:[{q:'Q',a:'A'}],score:80,summary:'Summary',durationSeconds:1,owner_id:'attacker',userId:'attacker'}
  assert.equal((await route.POST(h.request(payload,'Bearer '+SECRET))).status,201)
  assert.deepEqual(owners,['verified-owner'])
  h.setIdentity('other','verified-owner')
  assert.equal((await route.POST(h.request(payload,'Bearer '+SECRET))).status,401)
  assert.equal(owners.length,1)
})

for(const [name,body,raw,status] of [
  ['malformed JSON','{',true,400],['oversized body',' '.repeat(32769),true,413],
  ['unknown operation',{...question(),operation:'anything'},false,400],
  ['legacy system message',{system:PRIVATE,message:PRIVATE},false,400],
  ...['system','message','model','max_tokens','instructions','owner_id'].map(key=>['override '+key,{...question(),[key]:PRIVATE},false,400]),
  ['wrong type',{...feedback(),answer:123},false,400],
  ['oversized answer',{...feedback(),answer:'😀'.repeat(4001)},false,400],
  ['too many prior',{...question(),priorQuestions:Array(6).fill('Q')},false,400],
  ['too many pairs',{...evaluation(),answers:Array(6).fill({q:'Q',a:'A'})},false,400],
  ['oversized evaluation answer',{...evaluation(),answers:[{q:'Q',a:'😀'.repeat(4001)}]},false,400],
  ['empty evaluation',{...evaluation(),answers:[]},false,400],
  ['invalid config',{...question(),config:{...config,persona:'constructor'}},false,400],
  ['config override',{...question(),config:{...config,system:PRIVATE}},false,400],
  ['invalid canonical setup',{...question(),config:{...config,role:' padded'}},false,400],
  ['Q6',{...question(),ordinal:6},false,400],
  ['question too long',{...feedback(),question:'Q'.repeat(2001)},false,400],
]) test('Claude rejects '+name+' before upstream',async()=>{
  const h=harness({cookie:'user'}),response=await h.post(body,undefined,raw)
  assert.equal(response.status,status);assert.equal(h.calls.length,0);h.privacy(await response.text())
})
for (const [body,output] of [[question(),'A question?'],[feedback(),'Feedback'],[evaluation(),'{"score":80,"summary":"Evaluation"}']]) {
  test('Claude '+body.operation+' exactly one request with trusted configuration',async()=>{
    const h=harness({cookie:'user',upstream:()=>textResult(output)})
    const response=await h.post(body);assert.equal(response.status,200);assert.equal((await response.json()).text,output);assert.equal(h.calls.length,1)
    const sent=JSON.parse(h.calls[0].init.body)
    assert.equal(sent.model,'claude-sonnet-4-6');assert.equal(sent.max_tokens,1000)
    assert.ok(sent.system.includes('Respond only in English.'));assert.ok(sent.system.includes('untrusted JSON'))
    assert.deepEqual(JSON.parse(sent.messages[0].content),body)
    assert.equal(h.timers.size,0)
    assert.equal((await h.post(body)).status,200) // slot released
    h.privacy()
  })
}
test('Unicode limits use code points without truncation',async()=>{
  const h=harness({cookie:'user'})
  const body={...feedback(),answer:'😀'.repeat(4000)}
  assert.equal((await h.post(body)).status,200)
  assert.equal(JSON.parse(JSON.parse(h.calls[0].init.body).messages[0].content).answer,body.answer)
  h.setUpstream(audioResult);const t={...voice(),text:'😀'.repeat(2000)}
  assert.equal((await h.tts(t)).status,200);assert.equal(JSON.parse(h.calls[1].init.body).text,t.text)
})
test('server prompt keeps persona level type language and role/company data semantics',()=>{
  const h=harness()
  for(const [language,expected] of [['tr','Yalnızca Türkçe'],['en','Respond only in English'],['de','ausschließlich auf Deutsch']]) {
    for(const persona of ['friendly','formal','tough','curious']) {
      const input={...question(),config:{...config,language,persona},ordinal:5,priorQuestions:['Previous']}
      const prompt=h.contract.buildClaudePrompt(h.contract.parseClaudeInput(input))
      assert.ok(prompt.system.includes(expected));assert.ok(prompt.system.includes('Do not repeat'));assert.ok(prompt.system.includes('teknik'));assert.ok(prompt.system.includes('mid-level'))
      assert.deepEqual(JSON.parse(prompt.messages[0].content),input)
    }
  }
  assert.ok(h.contract.buildClaudePrompt({...feedback(),config:{...config,persona:'tough'}}).system.includes('Eleştirel'))
})
for(const [name,upstream] of [
  ['HTTP 400',()=>new Response(PRIVATE+SECRET,{status:400})],
  ['HTTP 500',()=>new Response(PRIVATE+SECRET,{status:500})],
  ['invalid JSON',()=>new Response(PRIVATE+SECRET)],
  ['wrong shape',()=>Response.json({content:[{type:'text',text:123}],private:PRIVATE})],
  ['empty text',()=>textResult(' ')],['wrong block',()=>Response.json({content:[{type:'image',text:PRIVATE}]})],
  ['oversized response',()=>new Response('x'.repeat(256*1024+1))],
  ['network exception',()=>{throw Error(PRIVATE+SECRET)}],
]) test('Claude sanitized '+name+' and no paid retry',async()=>{
  const h=harness({cookie:'user',upstream}),response=await h.post()
  assert.equal(response.status,502);h.privacy(await response.text());assert.equal(h.calls.length,1)
  h.setUpstream(()=>textResult('Recovered'));assert.equal((await h.post()).status,200)
})
test('Claude invalid evaluation response is failure, partial evaluation accepted',async()=>{
  const h=harness({cookie:'user',upstream:()=>textResult('{"score":101,"summary":"'+PRIVATE+'"}')})
  const response=await h.post(evaluation());assert.equal(response.status,502);h.privacy(await response.text())
  h.setUpstream(()=>textResult('{"score":70,"summary":"Partial"}'));assert.equal((await h.post(evaluation())).status,200)
})

for(const [name,body,raw,status] of [
  ['malformed JSON','{',true,400],['oversized body','x'.repeat(32769),true,413],
  ['arbitrary voice',{...voice(),voiceId:'attacker'},false,400],
  ['too much text',{...voice(),text:'😀'.repeat(2001)},false,400],
  ['empty text',{...voice(),text:' '},false,400],['wrong text type',{...voice(),text:2},false,400],
  ['override',{...voice(),model_id:'attacker'},false,400],
]) test('ElevenLabs rejects '+name+' before upstream',async()=>{
  const h=harness({cookie:'user'}),response=await h.tts(body,undefined,raw)
  assert.equal(response.status,status);assert.equal(h.calls.length,0);h.privacy(await response.text())
})
for(const voiceId of ['EXAVITQu4vr4xnSDxMaL','pNInz6obpgDQGcFmaJgB']) test('ElevenLabs existing allowed voice '+voiceId,async()=>{
  const h=harness({cookie:'user',upstream:audioResult})
  const response=await h.tts({...voice(),voiceId});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'audio/mpeg');assert.equal(h.calls.length,1)
  assert.ok(h.calls[0].url.endsWith(voiceId));assert.equal(JSON.parse(h.calls[0].init.body).model_id,'eleven_multilingual_v2')
  assert.equal((await h.tts()).status,200)
})
for(const [name,upstream] of [
  ['HTTP error',()=>new Response(PRIVATE+SECRET,{status:429})],
  ['wrong content type',()=>Response.json({error:PRIVATE+SECRET})],
  ['fake audio',()=>new Response(PRIVATE+SECRET,{headers:{'content-type':'audio/mpeg'}})],
  ['empty audio',()=>new Response('',{headers:{'content-type':'audio/mpeg'}})],
  ['oversized audio',()=>new Response(new Uint8Array(5*1024*1024+1),{headers:{'content-type':'audio/mpeg'}})],
]) test('ElevenLabs sanitized '+name+' without retry',async()=>{
  const h=harness({cookie:'user',upstream}),response=await h.tts()
  assert.equal(response.status,502);assert.equal(h.calls.length,1);h.privacy(await response.text())
  h.setUpstream(audioResult);assert.equal((await h.tts()).status,200)
})
for (const [method,ms] of [['post',30000],['tts',20000]]) {
  for(const phase of ['fetch','body']) test(method+' timeout in '+phase+' cancels and releases slot',async()=>{
    let signal,cancelled=false
    const delayed=deferred()
    const h=harness({cookie:'user',upstream:(_url,init)=>{
      signal=init.signal
      return phase==='fetch'?delayed.promise:new Response(new ReadableStream({pull(){},cancel(){cancelled=true}}))
    }})
    const work=h[method]();await tick();assert.equal(h.calls.length,1)
    h.fire(ms);const response=await work;assert.equal(response.status,504);assert.ok(signal.aborted);h.privacy(await response.text());assert.equal(h.calls.length,1)
    if(phase==='body')assert.ok(cancelled)
    if(phase==='fetch'){delayed.resolve(new Response(new ReadableStream({cancel(){cancelled=true}})));await tick();assert.ok(cancelled)}
    h.setUpstream(method==='post'?()=>textResult('Recovered'):audioResult)
    assert.equal((await h[method]()).status,200);assert.equal(h.timers.size,0)
  })
}
test('HeyGen deterministic disabled response with zero upstream calls and no token',async()=>{
  const h=harness(),a=await h.heygen.POST(),b=await h.heygen.POST()
  assert.equal(a.status,503);assert.equal(b.status,503);assert.deepEqual(await a.json(),{error:'provider_disabled'});assert.deepEqual(await b.json(),{error:'provider_disabled'});assert.equal(h.calls.length,0);h.privacy()
})
test('admission exact global/per-user limits, idempotent release',()=>{
  const h=harness(),admit=h.boundary.createAdmissionGuard(),release=[]
  release.push(admit('a'));assert.throws(()=>admit('a'),/provider_busy/)
  for(const user of ['b','c','d'])release.push(admit(user))
  assert.throws(()=>admit('e'),/provider_busy/)
  release[0]();release[0]();const again=admit('a');assert.throws(()=>admit('e'),/provider_busy/)
  again();for(const done of release)done();const done=admit('e');done()
})
test('routes reject concurrency before provider work, share admission across providers',async()=>{
  const hold=deferred(),h=harness({cookie:'a',upstream:()=>hold.promise.then(()=>textResult('Question'))}),pending=[]
  pending.push(h.post());await tick()
  assert.equal((await h.tts()).status,429);assert.equal(h.calls.length,1)
  for(const user of ['b','c','d']){h.setIdentity(user,null);pending.push(h.post());await tick()}
  h.setIdentity('e',null);assert.equal((await h.post()).status,429);assert.equal(h.calls.length,4)
  hold.resolve(textResult('Question'));for(const work of pending)assert.equal((await work).status,200)
  h.setUpstream(()=>textResult('Recovered'));assert.equal((await h.post()).status,200)
})
test('stream limits enforce consumed bytes even without content length and cancel overflow',async()=>{
  const h=harness();let cancelled=false
  const body=new ReadableStream({start(c){c.enqueue(new Uint8Array(4));c.enqueue(new Uint8Array(4))},cancel(){cancelled=true}})
  await assert.rejects(h.boundary.readLimited(body,7),/body_too_large/);assert.ok(cancelled)
  assert.equal((await h.boundary.readLimited(new Response('1234567').body,7)).length,7)
})
