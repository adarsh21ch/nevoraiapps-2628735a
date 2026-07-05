-- Fee cycle per tenant + indexes for the fee register
-- fee_cycle: 'calendar_month' = everyone due on the 1st (academies)
--            'joining_date'   = due on each student's monthly joining anniversary (gyms)
alter table public.tenants
  add column if not exists fee_cycle text not null default 'calendar_month';

create index if not exists payments_tenant_period_idx
  on public.payments(tenant_id, period) where period is not null;
create index if not exists payments_tenant_created_idx
  on public.payments(tenant_id, created_at desc);
create index if not exists students_tenant_status_idx
  on public.students(tenant_id, status);

-- Kirkland gets the WhatsApp reminders module (demo/sales headline feature)
update public.tenants
  set features = jsonb_set(features, '{whatsapp_reminders}', 'true'::jsonb)
  where slug = 'kirkland-cricket';

-- Gyms renew on joining-date anniversaries by default; academies stay calendar_month
update public.tenants set fee_cycle = 'joining_date' where niche = 'gym';
