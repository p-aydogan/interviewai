const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const Module = require('node:module')
const filename = require('node:path').join(__dirname, 'interview-session-state.ts')
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const loaded = new Module(filename, module)
loaded._compile(compiled, filename)
const { createInterviewSessionState } = loaded.exports
function accepted(s, text = '  Canonical question?  ') {
  const op = s.beginGeneration()
  assert.ok(op)
  const q = s.acceptQuestion(op.token, text)
  s.release(op.token)
  return q
}
function setup() { const s = createInterviewSessionState(); const q = accepted(s); return { s, q, answers: [] } }
function submit(h) { const op = h.s.claimAnswer('Answer'); if (op) h.answers.push(op.answer); return op }
function deferred() { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b }); return { promise, resolve, reject } }
async function generation(s, promise, events) {
  const op = s.beginGeneration()
  if (!op) return
  try { const q = s.acceptQuestion(op.token, await promise); if (q) { events.push(q.text); if (s.canSpeak(q)) events.push('tts:' + q.text) } }
  catch {} finally { if (s.release(op.token)) events.push('released') }
}
async function feedback(s, token, promise, events) {
  try { const value = await promise; if (s.isCurrent(token)) events.push(value) }
  catch {} finally { if (s.release(token)) events.push('released') }
}
const cases = [
 ['normal submit admission', () => { const h=setup(); assert.ok(submit(h)) }],
 ['answer commits once', () => { const h=setup(); submit(h); submit(h); assert.equal(h.answers.length,1) }],
 ['feedback success releases busy', async () => { const h=setup(), op=submit(h), e=[]; await feedback(h.s,op.token,Promise.resolve('feedback'),e); assert.deepEqual(e,['feedback','released']); assert.equal(h.s.busy,false) }],
 ['next question admission', () => { const h=setup(), op=submit(h); h.s.release(op.token); assert.equal(h.s.beginGeneration().ordinal,2) }],
 ['canonical question answer feedback speech and snapshot', () => { const h=setup(), op=submit(h); assert.equal(h.q.text,'Canonical question?'); assert.equal(op.answer.q,h.q.text); assert.equal(h.s.retryFeedback(),null); assert.ok(h.s.canSpeak(h.q)); h.s.release(op.token); const retry=h.s.retryFeedback(); assert.strictEqual(retry.answer,op.answer); h.s.release(retry.token); assert.equal(h.s.beginCompletion(h.answers).snapshot[0].q,h.q.text) }],
 ['immediate double submit rejects before mutation and feedback', () => { const h=setup(); const first=submit(h); assert.ok(first); assert.equal(submit(h),null); assert.equal(h.answers.length,1) }],
 ['submit immediate End rejected', () => { const h=setup(); submit(h); assert.equal(h.s.beginCompletion(h.answers),null) }],
 ['submit Skip overlap rejected', () => { const h=setup(); submit(h); assert.equal(h.s.beginGeneration(),null) }],
 ['generation End rejected', () => { const s=createInterviewSessionState(); s.beginGeneration(); assert.equal(s.beginCompletion([]),null) }],
 ['feedback End rejected', () => { const h=setup(); submit(h); assert.equal(h.s.beginCompletion(h.answers),null) }],
 ['completion submit rejected', () => { const h=setup(); h.s.beginCompletion([]); assert.equal(submit(h),null) }],
 ['completion generation rejected', () => { const h=setup(); h.s.beginCompletion([]); assert.equal(h.s.beginGeneration(),null) }],
 ['initial ordinal one', () => { assert.equal(setup().q.ordinal,1) }],
 ['Q4 to Q5', () => { const s=createInterviewSessionState(); for(let i=1;i<=5;i++) assert.equal(accepted(s,'Q'+i).ordinal,i) }],
 ['Q5 Next Skip completion admission', () => { const s=createInterviewSessionState(); for(let i=0;i<5;i++) accepted(s); assert.ok(s.beginCompletion([])) }],
 ['never request question six', () => { const s=createInterviewSessionState(); for(let i=0;i<5;i++) accepted(s); assert.equal(s.beginGeneration(),null) }],
 ['failed generation leaves ordinal', () => { const h=setup(), op=h.s.beginGeneration(); h.s.release(op.token); assert.equal(h.s.question.ordinal,1) }],
 ['retry same ordinal after failure', () => { const h=setup(), op=h.s.beginGeneration(); h.s.release(op.token); assert.equal(h.s.beginGeneration().ordinal,2) }],
 ['feedback rejection clears busy', async () => { const h=setup(), op=submit(h); await feedback(h.s,op.token,Promise.reject(Error('failed')),[]); assert.equal(h.s.busy,false) }],
 ['feedback failure preserves committed answer', async () => { const h=setup(), op=submit(h); await feedback(h.s,op.token,Promise.reject(Error()),[]); assert.equal(h.answers.length,1); assert.equal(h.s.answered,true) }],
 ['feedback retry same committed pair', () => { const h=setup(), op=submit(h); h.s.release(op.token); assert.strictEqual(h.s.retryFeedback().answer,op.answer) }],
 ['feedback retry cannot append duplicate', () => { const h=setup(), op=submit(h); h.s.release(op.token); h.s.retryFeedback(); assert.equal(submit(h),null); assert.equal(h.answers.length,1) }],
 ['malformed empty questions rejected', () => { for(const value of [null,{},42,'','  ']) { const s=createInterviewSessionState(), op=s.beginGeneration(); assert.equal(s.acceptQuestion(op.token,value),null); assert.equal(s.question,null); s.release(op.token) } }],
 ['generation rejection always releases', async () => { const s=createInterviewSessionState(), e=[]; await generation(s,Promise.reject(Error()),e); assert.deepEqual(e,['released']); assert.equal(s.busy,false) }],
 ['immutable completion snapshot', () => { const h=setup(), op=submit(h); h.s.release(op.token); const c=h.s.beginCompletion(h.answers); assert.ok(Object.isFrozen(c.snapshot)); assert.ok(Object.isFrozen(c.snapshot[0])) }],
 ['live mutation cannot alter snapshot', () => { const h=setup(), op=submit(h); h.s.release(op.token); const c=h.s.beginCompletion(h.answers); h.answers[0]={q:'changed',a:'changed'}; h.answers.push({q:'extra',a:'extra'}); assert.deepEqual(c.snapshot,[op.answer]) }],
 ['evaluation persistence same answer set', () => { const h=setup(), op=submit(h); h.s.release(op.token); const {snapshot}=h.s.beginCompletion(h.answers); const evaluation=snapshot.map(x=>x.q+' '+x.a); const payload=JSON.parse(JSON.stringify({answers:snapshot})); assert.deepEqual(evaluation,payload.answers.map(x=>x.q+' '+x.a)) }],
 ['late question after completion inert', async () => { const s=createInterviewSessionState(), op=s.beginGeneration(), d=deferred(), e=[]; const work=d.promise.then(value=>{ const q=s.acceptQuestion(op.token,value); if(q) { e.push(q.text); if(s.canSpeak(q)) e.push('tts') } }); assert.equal(s.beginCompletion([]),null); s.release(op.token); s.beginCompletion([]); d.resolve('late'); await work; assert.deepEqual(e,[]); assert.equal(s.question,null) }],
 ['late feedback after completion inert', async () => { const h=setup(), op=submit(h), d=deferred(), e=[]; const work=feedback(h.s,op.token,d.promise,e); h.s.release(op.token); h.s.beginCompletion(h.answers); d.resolve('late'); await work; assert.deepEqual(e,[]); assert.equal(h.s.busy,true) }],
 ['old question cannot start TTS after completion', () => { const h=setup(); h.s.beginCompletion([]); assert.equal(h.s.canSpeak(h.q),false) }],
 ['dispose late question', async () => { const s=createInterviewSessionState(), d=deferred(), e=[]; const work=generation(s,d.promise,e); s.dispose(); d.resolve('late'); await work; assert.deepEqual(e,[]) }],
 ['dispose late feedback', async () => { const h=setup(), op=submit(h), d=deferred(), e=[]; const work=feedback(h.s,op.token,d.promise,e); h.s.dispose(); d.resolve('late'); await work; assert.deepEqual(e,[]) }],
 ['zero answers releases completion for usable session', () => { const h=setup(), c=h.s.beginCompletion([]); assert.equal(c.snapshot.length,0); h.s.release(c.token); assert.ok(submit(h)) }],
 ['partial snapshot only submitted answers', () => { const h=setup(), op=submit(h); h.s.release(op.token); accepted(h.s,'Skipped'); assert.equal(h.s.beginCompletion(h.answers).snapshot.length,1) }],
 ['skip creates no answer', () => { const h=setup(); accepted(h.s,'Next'); assert.equal(h.answers.length,0) }],
 ['one completion at once', () => { const h=setup(); h.s.beginCompletion([]); assert.equal(h.s.beginCompletion([]),null) }],
 ['completion failure explicit retry', () => { const h=setup(), c=h.s.beginCompletion([]); assert.ok(h.s.release(c.token)); assert.ok(h.s.beginCompletion([])) }],
 ['retry identity distinct no server dedup guarantee', () => { const h=setup(), c=h.s.beginCompletion([]); h.s.release(c.token); const next=h.s.beginCompletion([]); assert.notEqual(next.token.id,c.token.id) }],
 ['generation token cannot accept twice', () => { const s=createInterviewSessionState(), op=s.beginGeneration(); assert.ok(s.acceptQuestion(op.token,'Q')); assert.equal(s.acceptQuestion(op.token,'other'),null); assert.equal(s.question.ordinal,1) }],
 ['superseded generation cannot commit or release newer operation', () => { const s=createInterviewSessionState(), op=s.beginGeneration(); s.release(op.token); const c=s.beginCompletion([]); assert.equal(s.acceptQuestion(op.token,'late'),null); assert.equal(s.release(op.token),false); assert.ok(s.isCurrent(c.token)) }],
]
for(const [name, run] of cases) test(name,run)
const page = fs.readFileSync(require('node:path').join(__dirname,'../../app/interview/page.tsx'),'utf8')
const workspace = fs.readFileSync(require('node:path').join(__dirname,'../../components/interview/InterviewWorkspace.tsx'),'utf8')
const controls = fs.readFileSync(require('node:path').join(__dirname,'../../components/interview/LiveInterviewControls.tsx'),'utf8')
test('page synchronous guards precede mutation and provider requests', () => {
 assert.match(page,/claimAnswer\(answer\)[\s\S]*if \(!admission\) return[\s\S]*answersRef.current.push\(admission.answer\)/)
 assert.match(page,/beginCompletion\(answersRef.current\)[\s\S]*if \(!admission\) return[\s\S]*stopCurrentAudio\(\)/)
 assert.match(page,/if \(qNumRef.current >= MAX_Q\) await endCall\(\)/)
 assert.match(page,/session.acceptQuestion\(token, q\)[\s\S]*qNumRef.current = accepted.ordinal/)
 assert.match(page,/session.release\(token\)\) setQLoading\(false\)/)
})
test('page snapshot persistence UUID zero-answer and canonical contracts', () => {
 assert.match(page,/snapshot: answers/); assert.match(page,/answers.map\(/); assert.match(page,/language,\s*answers,\s*score: evaluation.score/)
 assert.doesNotMatch(page,/const answers = answersRef.current/)
 assert.match(page,/if \(!answers.length\)[\s\S]*copy.zeroAnswerWarning[\s\S]*return/)
 assert.match(page,/RESULT_UUID_PATTERN.test\(value.id\)/); assert.match(page,/router.push\(`\/result\/\$\{encodeURIComponent\(savedInterview.id\)\}`\)/)
 assert.match(page,/curQRef.current = accepted.text; setQuestion\(accepted.text\)/); assert.match(page,/speakText\(accepted\)/)
 assert.match(page,/submitted.q/); assert.match(page,/session.canSpeak\(accepted\)/); assert.match(page,/session.dispose\(\)/)
 assert.match(page,/if \(!res.ok\) throw/); assert.match(page,/typeof data.text !== 'string'/)
})
test('UI guards and localized retries wired', () => {
 assert.match(controls,/disabled=\{isCompleting \|\| transitionBusy\}/); assert.match(page,/transitionBusy=\{qLoading\}/)
 assert.match(workspace,/!question \|\| !answer.trim\(\)/); assert.match(workspace,/disabled=\{qLoading \|\| isCompleting\}/)
 for(const name of ['onRetryFeedback','onRetryQuestion','feedbackFailureMessage','questionFailureMessage']) { assert.ok(page.includes(name)); assert.ok(workspace.includes(name)) }
 assert.equal((page.match(/retryFeedback: '/g)||[]).length,3)
})
// Execute the real page handlers with hook/provider mocks; no browser or external services.
function pageHarness(language = 'en') {
  const vm = require('node:vm'), path = require('node:path')
  let cursor=0, mounting=true, tree
  const hooks=[], effects=[], cleanups=[], requests=[], routes=[], audio=[]
  const React = {
    createElement(type, props, ...children) { return {type, props: {...props, children}} },
    useRef(value) { const i=cursor++; if(!hooks[i]) hooks[i]={current:value}; return hooks[i] },
    useState(value) { const i=cursor++; if(mounting) hooks[i]=value; return [hooks[i],next=>{hooks[i]=typeof next==='function'?next(hooks[i]):next}] },
    useCallback(fn) { const i=cursor++; if(!hooks[i]) hooks[i]=fn; return hooks[i] },
    useEffect(fn) { cursor++; if(mounting) effects.push(fn) },
    Suspense: 'Suspense',
  }
  React.default=React
  const imports = {
    react: React,
    'next/navigation': { useSearchParams:()=>({get:key=>key==='language'?language:null}), useRouter:()=>({push:route=>routes.push(route)}) },
    '@/lib/interviews/interview-session-state': loaded.exports,
    '@/components/ui': {TalentryButton:'Button'},
    '@/components/interview/InterviewWorkspace': { default:'Workspace', InterviewFeedbackCard:'FeedbackCard' },
    '@/components/interview/LiveInterviewControls': { default:'Controls' },
    '@/components/interview/LiveInterviewHeader': { default:'Header' },
    '@/components/interview/InterviewerStage': { default:'Stage' },
    './interview.module.css': {default:{}},
  }
  const scope = {
    React,
    exports:{}, require:name=>{assert.ok(name in imports,name);return imports[name]},
    console:{warn(){},error(){}}, setInterval:()=>1, clearInterval(){},
    navigator:{mediaDevices:{getUserMedia:()=>Promise.reject(Error('mock camera'))}},
    window:{matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}})},
    fetch:(url,options)=>{ const d=deferred(); requests.push({url,body:JSON.parse(options.body),...d}); return d.promise },
    URL:{createObjectURL:()=> 'mock:audio',revokeObjectURL(){}},
    Audio:class { constructor(){audio.push(this)} addEventListener(){} play(){return Promise.resolve()} pause(){this.paused=true} },
  }
  const output=ts.transpileModule(page,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText
  vm.runInNewContext(output,scope)
  const content=scope.exports.default().props.children[0].type
  function render(){cursor=0;tree=content();mounting=false;return tree}
  function find(type,node=tree){if(!node||typeof node!=='object')return null;if(node.type===type)return node.props;for(const child of (node.props?.children||[]).flat(Infinity)){const result=find(type,child);if(result)return result}return null}
  render(); for(const effect of effects) cleanups.push(effect())
  return { requests,routes,audio,hooks,render,workspace:()=>find('Workspace'),controls:()=>find('Controls'),dispose:()=>cleanups.forEach(fn=>fn?.()) }
}
const flush = async () => { for(let i=0;i<12;i++) await Promise.resolve() }
const textResponse = text => ({ok:true,json:async()=>({text})})
async function initial(h,text='  Canonical Q?  ') { h.requests[0].resolve(textResponse(text)); await flush();h.render() }
async function pageSubmit(h) { h.workspace().onAnswerChange('Original answer'); h.render(); const work=h.workspace().onSubmit(); h.render();return {work} }
test('real page double submit and busy End Skip guards before provider calls',async()=>{
 const h=pageHarness(); await h.controls().onEnd(); assert.equal(h.requests.length,1); await initial(h)
 h.workspace().onAnswerChange('Answer');h.render();const submit=h.workspace().onSubmit
 const first=submit();await submit();await h.controls().onEnd();await h.workspace().onNext();h.render()
 assert.equal(h.requests.length,3) // initial question, TTS, one feedback
 assert.equal(h.controls().transitionBusy,true)
 h.requests[2].resolve(textResponse('{"strength":"S","improvement":"I","suggestion":"T"}'));await first;h.render()
 assert.equal(h.workspace().qLoading,false);assert.equal(h.controls().transitionBusy,false)
 assert.equal(h.workspace().question,'Canonical Q?');assert.equal(h.requests[1].body.text,'Canonical Q?');assert.equal(h.requests[2].body.message,'Soru: "Canonical Q?"\nCevap: "Answer"')
 h.dispose()
})
test('real page feedback HTTP failure retry reuses committed pair exactly once',async()=>{
 const h=pageHarness('de');await initial(h);const {work}=await pageSubmit(h)
 h.requests[2].resolve({ok:false,status:503});await work;h.render();assert.equal(h.workspace().qLoading,false);assert.ok(h.workspace().feedbackFailureMessage);assert.equal(h.workspace().feedbackRetryLabel,'Feedback erneut versuchen')
 const retry=h.workspace().onRetryFeedback();assert.deepEqual(h.requests[3].body,h.requests[2].body)
 h.requests[3].resolve(textResponse('Feedback'));await retry;h.render()
 const end=h.controls().onEnd();h.requests[4].resolve(textResponse('{"score":80,"summary":"Summary"}'));await flush()
 assert.equal(h.requests[5].url,'/api/interviews');assert.equal(h.requests[5].body.answers.length,1);assert.equal(h.requests[5].body.answers[0].q,'Canonical Q?')
 h.requests[5].resolve({ok:true,json:async()=>({id:'11111111-1111-4111-8111-111111111111'})});await end;assert.deepEqual(h.routes,['/result/11111111-1111-4111-8111-111111111111']);h.dispose()
})
test('real page initial malformed question retry retains ordinal one',async()=>{
 const h=pageHarness('tr');h.requests[0].resolve({ok:true,json:async()=>({text:42})});await flush();h.render()
 assert.equal(h.workspace().questionNumber,0);assert.equal(h.workspace().qLoading,false);assert.ok(h.workspace().questionFailureMessage)
 const retry=h.workspace().onRetryQuestion();assert.equal(h.requests[1].body.message,'1. mülakat sorusu');h.requests[1].resolve(textResponse('Valid'));await retry;h.render();assert.equal(h.workspace().questionNumber,1);h.dispose()
})
test('real page zero answers performs no evaluation save or navigation and remains usable',async()=>{
 const h=pageHarness();await initial(h);await h.controls().onEnd();h.render();assert.ok(h.controls().completionError);assert.equal(h.controls().isCompleting,false);assert.equal(h.requests.length,2);assert.deepEqual(h.routes,[])
 h.workspace().onAnswerChange('Answer');h.render();const work=h.workspace().onSubmit();assert.equal(h.requests.length,3);h.requests[2].resolve(textResponse('Feedback'));await work;h.dispose()
})
test('real page Q5 Next completes partial answers and never requests six',async()=>{
 const h=pageHarness();await initial(h)
 for(let n=2;n<=5;n++){const next=h.workspace().onNext();const req=h.requests.at(-1);assert.equal(req.body.message,`${n}. mülakat sorusu`);req.resolve(textResponse('Q'+n));await next;h.render()}
 const {work}=await pageSubmit(h);h.requests.at(-1).resolve(textResponse('Feedback'));await work;h.render()
 const next=h.workspace().onNext();h.requests.at(-1).resolve(textResponse('{"score":70,"summary":"Partial"}'));await flush();const save=h.requests.at(-1)
 assert.equal(save.url,'/api/interviews');assert.equal(save.body.answers.length,1);assert.equal(save.body.answers[0].q,'Q5');assert.equal(h.requests.some(r=>r.body.message==='6. mülakat sorusu'),false)
 save.resolve({ok:true,json:async()=>({id:'11111111-1111-4111-8111-111111111111'})});await next;h.dispose()
})
test('real page dispose prevents late question feedback and audio mutation',async()=>{
 const h=pageHarness();h.dispose();h.requests[0].resolve(textResponse('late'));await flush();h.render();assert.equal(h.workspace().question,'');assert.equal(h.requests.length,1)
 const f=pageHarness();await initial(f);const {work}=await pageSubmit(f);f.dispose();f.requests[2].resolve(textResponse('late feedback'));f.requests[1].resolve({ok:true,blob:async()=>({})});await work;await flush();f.render();assert.equal(f.workspace().feedback,null);assert.equal(f.audio.length,0)
})
test('real page completion invalidates pending TTS and failure permits explicit retry',async()=>{
 const h=pageHarness();await initial(h);const {work}=await pageSubmit(h);h.requests[2].resolve(textResponse('Feedback'));await work;h.render()
 const end=h.controls().onEnd();h.requests[1].resolve({ok:true,blob:async()=>({})});h.requests[3].resolve(textResponse('{"score":999,"summary":"Invalid"}'));await end;await flush();h.render();assert.equal(h.audio.length,0);assert.equal(h.controls().isCompleting,false);assert.ok(h.controls().completionError)
 const retry=h.controls().onEnd();assert.equal(h.requests.length,5);h.requests[4].resolve({ok:false,status:500});await retry;h.dispose()
})
