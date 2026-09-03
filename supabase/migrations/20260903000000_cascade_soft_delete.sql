-- Soft-deleting a contact must soft-delete its reminders.
--
-- The FK carries `on delete cascade`, but netup never hard-deletes: it sets `deleted_at`
-- so other devices can see the removal. A soft delete does not fire that cascade, so
-- without this trigger a deleted contact's reminders stay live on the server, and a fresh
-- install pulls them back as orphans pointing at a contact it will never create.
--
-- The client also records the cascade in its own change log (see `deleteContact`); this
-- is the belt-and-braces half, so the invariant holds no matter which client wrote it.

create or replace function public.cascade_contact_soft_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    update public.reminders
       set deleted_at = new.deleted_at
     where contact_id = new.id
       and deleted_at is null;
  end if;
  return null;
end;
$$;

create trigger contacts_cascade_soft_delete
  after update of deleted_at on public.contacts
  for each row execute function public.cascade_contact_soft_delete();
