"""Authenticated regression checks. Use an owner session minted by lovable auth-session --self.
Never prints credentials. This test makes no successful writes.
Run: python3 tests/email_connections_access.py
"""
import asyncio
import json
import os
from playwright.async_api import async_playwright

OWNER_WORKSPACE = "fbb6e57e-21cc-435a-b2f8-9ee341c79a75"
OTHER_WORKSPACE = "c1011000-9f75-4077-af3a-79eb451c4c58"


async def main():
    with open(os.path.expanduser("~/.cache/lovable-auth/session.json")) as file:
        minted = json.load(file)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        await page.goto("http://localhost:8080")
        await page.evaluate("([k,v]) => localStorage.setItem(k,v)", [minted["storage_key"], json.dumps(minted["session"])])
        await page.goto("http://localhost:8080/email-connections")
        await page.get_by_role("heading", name="Namecheap Private Email").wait_for()
        results = await page.evaluate("""async ([own, other]) => {
          const api = await import('/src/lib/email-connections.functions.ts');
          const {supabase} = await import('/src/integrations/supabase/client.ts');
          const checks = [];
          const assert = (value, name) => { if (!value) throw Error(name); checks.push(name); };
          const denied = async (run, name) => { let rejected = false; try { await run(); } catch { rejected = true; } assert(rejected, name); };
          const owned = await api.getEmailAdministration({data:{workspaceId:own}});
          assert(owned.businesses.length > 0, 'Owner reads saved pilot');
          const business = owned.businesses[0];
          const config = {workspaceId:own,businessId:business.id,email:'smcqueen@cleanmytap.com',provider:'namecheap',imapHost:'mail.privateemail.com',imapPort:993,imapTls:true,smtpHost:'mail.privateemail.com',smtpPort:465,smtpTls:true};
          await denied(() => api.getEmailAdministration({data:{workspaceId:other}}), 'Server rejects foreign workspace reads');
          await denied(() => api.createEmailBusiness({data:{workspaceId:other,name:'Forbidden regression'}}), 'Server rejects foreign business creation');
          await denied(() => api.saveEmailConfiguration({data:{...config,workspaceId:other}}), 'Server rejects cross-tenant configuration');
          await denied(() => api.saveEmailConfiguration({data:{...config,businessId:'00000000-0000-4000-8000-000000000001'}}), 'Server rejects unowned business');
          await denied(() => api.saveEmailConfiguration({data:{...config,password:'fake-regression-value'}}), 'RPC rejects credential fields');
          assert(Object.keys(api).sort().join(',') === ['createEmailBusiness','getEmailAdministration','listEmailWorkspaces','saveEmailConfiguration'].sort().join(','), 'No credential, sync or send endpoint exported');
          for (const table of ['email_businesses','business_email_connections','business_email_audit']) {
            const result = await supabase.from(table).select('id').eq('workspace_id',other);
            assert(!result.error && result.data.length === 0, 'RLS hides foreign '+table);
          }
          const update = await supabase.from('email_businesses').update({name:'Forbidden regression'}).eq('id',business.id);
          assert(Boolean(update.error), 'Database denies configuration edits');
          const forged = await supabase.from('business_email_audit').insert({workspace_id:own,business_id:business.id,actor_id:owned.audit[0].actor_id,action:'business_created'});
          assert(Boolean(forged.error), 'Database denies forged audit events');
          const anonymous = await fetch(import.meta.env?.VITE_SUPABASE_URL || '/not-used');
          return checks;
        }""".replace("          const anonymous = await fetch(import.meta.env?.VITE_SUPABASE_URL || '/not-used');\n", ""), [OWNER_WORKSPACE, OTHER_WORKSPACE])
        for result in results:
            print("PASS:", result)
        for name in ["Test connection", "Sync", "Send"]:
            for button in await page.get_by_role("button", name=name, exact=True).all():
                assert await button.is_disabled(), name
        assert await page.get_by_label("Mailbox password").is_disabled()
        print("PASS: All mailbox actions and password entry disabled")
        await browser.close()


asyncio.run(main())