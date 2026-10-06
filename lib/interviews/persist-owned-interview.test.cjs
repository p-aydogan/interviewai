const { test } = require('node:test')
const assert = require('node:assert/strict')
const { NextResponse } = require('next/server')
const { load, plain, uuid, cursor } = require('./history-test-helpers.cjs')
const identity = load('lib/interviews/interview-completion-state.ts', {})
const payload = () => ({ interviewerKey:'f',role:'Engineer',company:'Example',level:'mid',interviewType:'technical',persona:'formal',language:'en',answers:[{q:'Q1',a:'A1'},{q:'Q2',a:'A2'}],score:80,summary:'Summary',durationSeconds:60 })
const unique = {code:'23505',message:'duplicate key value violates unique constraint "interviews_pkey"'}
function harness(options={}) {
  const rows=new Map(),calls=[]
  const admin={from(table){assert.equal(table,'interviews');let inserted,filters=[];return {
    insert(row){calls.push(['insert',plain(row)]);inserted=plain(row);return this},
    select(fields){calls.push(['select',fields]);return this},
    eq(key,value){filters.push([key,value]);calls.push(['eq',key,value]);return this},
    async single(){await Promise.resolve();if(options.throwInsert)throw Error('DB');if(options.insertError)return {error:options.insertError,data:null};if(rows.has(inserted.id))return {error:unique,data:null};rows.set(inserted.id,inserted);return {data:{id:inserted.id},error:null}},
    async maybeSingle(){if(options.readError)return {data:null,error:{code:'DB'}};const row=[...rows.values()].find(row=>filters.every(([key,value])=>row[key]===value));return {data:row||null,error:null}},
  }}}
  const helper=load('lib/interviews/persist-owned-interview.ts',{'server-only':{},'@/lib/supabase/admin':{createAdminClient:()=>admin}})
  const route=load('app/api/interviews/route.ts',{'next/server':{NextResponse},'@/lib/auth/get-authenticated-user':{async getAuthenticatedUser(){calls.push(['auth']);return options.unauthorized?{status:'unauthorized'}:{status:'authenticated',user:{id:'owner-a'}}}},'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/interviews/history-cursor':cursor,'@/lib/interviews/interview-completion-state':identity,'@/lib/interviews/persist-owned-interview':helper})
  return {rows,calls,...helper,async post(body={completionId:uuid(1),...payload()},invalidJson=false){return route.POST({async json(){calls.push(['json']);if(invalidJson)throw Error('JSON');return body}})}}
}
// Shared only with the approved page suite; all imports are isolated and no network is used.
module.exports={harness,payload,unique}
if (require.main === module) {
test('first insert and matching replay keep one row and return same ID',async()=>{const h=harness();assert.deepEqual(plain(await h.persistOwnedInterview('owner-a',uuid(1),payload())),{status:'saved',id:uuid(1),replayed:false});assert.deepEqual(plain(await h.persistOwnedInterview('owner-a',uuid(1),payload())),{status:'saved',id:uuid(1),replayed:true});assert.equal(h.rows.size,1);assert.equal(h.calls[0][0],'insert');assert.equal(h.rows.get(uuid(1)).owner_id,'owner-a');assert.ok(h.calls.some(c=>c[0]==='eq'&&c[1]==='owner_id'&&c[2]==='owner-a'))})
for(const field of ['interviewerKey','role','company','level','interviewType','persona','language','score','summary','durationSeconds','answers']) test('conflicting '+field+' rejects without overwrite',async()=>{const h=harness();await h.persistOwnedInterview('owner-a',uuid(1),payload());const before=plain(h.rows.get(uuid(1))),p=payload();p[field]=field==='answers'?[{q:'Changed',a:'A'}]:typeof p[field]==='number'?81:'Changed';assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),p)).status,'conflict');assert.deepEqual(h.rows.get(uuid(1)),before)})
test('foreign collision returns no foreign fields',async()=>{const h=harness();await h.persistOwnedInterview('owner-b',uuid(1),payload());assert.deepEqual(plain(await h.persistOwnedInterview('owner-a',uuid(1),payload())),{status:'conflict'});assert.equal(h.rows.size,1)})
for(const error of [{code:'500',message:'failed'},{code:'23505',message:'unique constraint "other_key"'},{code:'23505',message:'unknown'}]) test('unrelated DB error '+error.message+' does not recover',async()=>{const h=harness({insertError:error});assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),payload())).status,'error');assert.equal(h.calls.some(c=>c[0]==='eq'),false)})
test('recovery read failure is persistence error',async()=>{const h=harness({readError:true});await h.persistOwnedInterview('owner-a',uuid(1),payload());assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),payload())).status,'error')})
test('recognized conflict with unavailable row stays generic conflict',async()=>{const h=harness({insertError:unique});assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),payload())).status,'conflict')})
test('thrown DB error is bounded',async()=>{const h=harness({throwInsert:true});assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),payload())).status,'error')})
test('different identities permit identical records',async()=>{const h=harness();await h.persistOwnedInterview('owner-a',uuid(1),payload());await h.persistOwnedInterview('owner-a',uuid(2),payload());assert.equal(h.rows.size,2)})
test('answer order matters and property order does not',async()=>{const h=harness();await h.persistOwnedInterview('owner-a',uuid(1),payload());const p=payload();p.answers=p.answers.map(({q,a})=>({a,q}));assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),p)).replayed,true);p.answers.reverse();assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),p)).status,'conflict')})
test('controlled concurrent inserts return one insert one replay',async()=>{const h=harness();const results=await Promise.all([h.persistOwnedInterview('owner-a',uuid(1),payload()),h.persistOwnedInterview('owner-a',uuid(1),payload())]);assert.equal(h.rows.size,1);assert.deepEqual(results.map(r=>r.replayed).sort(),[false,true])})
async function check(response,status,body){assert.equal(response.status,status);assert.deepEqual(await response.json(),body);assert.equal(response.headers.get('Cache-Control'),'private, no-store')}
test('route auth precedes JSON and unauthorized touches no database',async()=>{const h=harness({unauthorized:true});await check(await h.post(),401,{error:'Unauthorized'});assert.deepEqual(h.calls,[['auth']])})
test('route invalid JSON preserves contract',async()=>{await check(await harness().post({},true),400,{error:'Invalid JSON body'})})
for(const completionId of [undefined,'bad',uuid(1).replace('-4000-','-1000-')]) test('route rejects identity '+completionId,async()=>{const h=harness();await check(await h.post({...payload(),completionId}),400,{error:'Invalid completion identity'});assert.equal(h.rows.size,0)})
test('route rejects invalid payload',async()=>{await check(await harness().post({completionId:uuid(1)}),400,{error:'Invalid interview payload'})})
test('route first replay conflict and client owner isolation',async()=>{const h=harness(),body={completionId:uuid(1),...payload(),owner_id:'foreign'};await check(await h.post(body),201,{id:uuid(1),replayed:false});await check(await h.post(body),200,{id:uuid(1),replayed:true});await check(await h.post({...body,score:1}),409,{error:'Completion conflict'});assert.equal(h.rows.get(uuid(1)).owner_id,'owner-a');assert.deepEqual(h.calls.slice(0,2),[['auth'],['json']])})
test('route foreign collision has identical generic conflict body',async()=>{const h=harness();await h.persistOwnedInterview('foreign',uuid(1),payload());await check(await h.post(),409,{error:'Completion conflict'})})
test('route DB and recovery errors are generic 500',async()=>{await check(await harness({insertError:{code:'DB',message:'private'}}).post(),500,{error:'Failed to save interview'});const h=harness({readError:true});await h.post();await check(await h.post(),500,{error:'Failed to save interview'})})

}
