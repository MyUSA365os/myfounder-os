import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, LockKeyhole, Mail, Plus, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  createEmailBusiness,
  getEmailAdministration,
  listEmailWorkspaces,
  saveEmailConfiguration,
} from "@/lib/email-connections.functions";
import { businessInput, connectionInput, type Business } from "@/lib/email-connections.schema";
import { mailboxLinkForBusiness } from "@/lib/mailbox-workspace-links";

export function EmailConnectionsAdmin() {
  const { user } = useAuth();
  const listWorkspaces = useServerFn(listEmailWorkspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const workspaces = useQuery({
    queryKey: ["email-workspaces", user?.id],
    queryFn: () => listWorkspaces(),
    enabled: Boolean(user),
    retry: false,
  });
  const workspaceId = workspaces.data?.some((w) => w.id === selectedWorkspace)
    ? selectedWorkspace
    : (workspaces.data?.[0]?.id ?? "");

  return (
    <main className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> Owner administration
          </div>
          <h2 className="text-2xl font-semibold">Business Email Connections</h2>
        </div>
        <div className="w-full sm:w-72">
          <Label htmlFor="email-workspace">Workspace</Label>
          <Select
            value={workspaceId}
            onValueChange={setSelectedWorkspace}
            disabled={workspaces.isPending || !workspaceId}
          >
            <SelectTrigger id="email-workspace" className="mt-2">
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.data?.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-start gap-3 border-y border-border bg-muted/30 py-5">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div>
          <h3 className="font-medium">Needs secure credential backend</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configuration only. No mailbox is connected. Password entry, testing, sync and sending
            are unavailable. Namecheap connection and tests are managed in uGotLeads; this Founder HQ
            page only stores configuration.
          </p>
        </div>
      </div>
      {workspaces.isPending ? (
        <Skeleton className="h-32 w-full" />
      ) : workspaces.isError ? (
        <ErrorState onRetry={() => void workspaces.refetch()} />
      ) : !workspaceId ? (
        <p className="text-sm text-muted-foreground">No owned workspace is available.</p>
      ) : (
        <WorkspaceAdministration
          key={`${user?.id}:${workspaceId}`}
          workspaceId={workspaceId}
          userId={user?.id ?? ""}
        />
      )}
    </main>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-destructive">Email administration is unavailable right now.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}

function WorkspaceAdministration({ workspaceId, userId }: { workspaceId: string; userId: string }) {
  const fetchAdministration = useServerFn(getEmailAdministration);
  const queryClient = useQueryClient();
  const queryKey = ["email-administration", userId, workspaceId];
  const administration = useQuery({
    queryKey,
    queryFn: () => fetchAdministration({ data: { workspaceId } }),
    retry: false,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey });
  if (administration.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  if (administration.isError) return <ErrorState onRetry={() => void administration.refetch()} />;
  const { businesses, connections, audit } = administration.data;
  const businessName = (id: string) => businesses.find((b) => b.id === id)?.name ?? "Business";
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <BusinessForm workspaceId={workspaceId} businesses={businesses} onSaved={refresh} />
        <ConfigurationForm workspaceId={workspaceId} businesses={businesses} onSaved={refresh} />
      </div>
      <section className="border-t border-border pt-6" aria-labelledby="saved-mailboxes">
        <div className="mb-4 flex items-center justify-between">
          <h3 id="saved-mailboxes" className="text-lg font-semibold">
            Saved configurations
          </h3>
          <Badge variant="secondary">{connections.length}</Badge>
        </div>
        {connections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No mailbox configurations saved.</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {connections.map((connection) => {
              const name = businessName(connection.business_id);
              const mailboxLink = mailboxLinkForBusiness(name);
              return (
              <article key={connection.id} className="min-w-0 rounded-md border border-border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold">{name}</h4>
                    <p className="mt-1 break-all text-sm text-muted-foreground">
                      {connection.email}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {connection.status === "not_connected" ? "Not connected" : "Needs credentials"}
                  </Badge>
                </div>
                {mailboxLink && (
                  <div className="mt-4 rounded-md border border-primary/40 bg-primary/5 p-4">
                    <p className="text-sm font-medium">Live mailbox is managed in uGotLeads</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Namecheap connection and tests are managed in uGotLeads; this Founder HQ page
                      only stores configuration.
                    </p>
                    <Button asChild size="sm" className="mt-3">
                      <a href={mailboxLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Manage live {name} mailbox in uGotLeads
                      </a>
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      In uGotLeads, scroll to Mailbox.
                    </p>
                  </div>
                )}
                <dl className="mt-4 space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">IMAP · SSL/TLS</dt>
                    <dd className="break-all">
                      {connection.imap_host}:{connection.imap_port}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">SMTP · SSL/TLS</dt>
                    <dd className="break-all">
                      {connection.smtp_host}:{connection.smtp_port}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Test connection
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Sync
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Send
                  </Button>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>
      <section className="border-t border-border pt-6" aria-labelledby="email-audit">
        <h3 id="email-audit" className="mb-4 text-lg font-semibold">
          Audit log
        </h3>
        {audit.length === 0 ? (
          <p className="text-sm text-muted-foreground">No email administration activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4 font-medium">Time</th>
                  <th className="py-3 pr-4 font-medium">Action</th>
                  <th className="py-3 pr-4 font-medium">Business</th>
                  <th className="py-3 font-medium">Actor ID</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((event) => (
                  <tr key={event.id} className="border-b border-border">
                    <td className="whitespace-nowrap py-3 pr-4">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4">
                      {event.action === "business_created"
                        ? "Business created"
                        : "Configuration saved"}
                    </td>
                    <td className="py-3 pr-4">{businessName(event.business_id)}</td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">
                      {event.actor_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function BusinessForm({
  workspaceId,
  businesses,
  onSaved,
}: {
  workspaceId: string;
  businesses: Business[];
  onSaved: () => Promise<unknown>;
}) {
  const createBusiness = useServerFn(createEmailBusiness);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: (data: { workspaceId: string; name: string }) => createBusiness({ data }),
  });
  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const parsed = businessInput.safeParse({ workspaceId, name });
    if (!parsed.success) {
      setMessage("Enter a business name, up to 120 characters.");
      return;
    }
    try {
      const result = await mutation.mutateAsync(parsed.data);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setName("");
      setMessage("Business saved.");
      await onSaved();
    } catch {
      setMessage("Unable to add business right now.");
    }
  }
  return (
    <section aria-labelledby="businesses-heading">
      <h3 id="businesses-heading" className="text-lg font-semibold">
        Businesses
      </h3>
      <ul className="my-4 divide-y divide-border">
        {businesses.map((b) => (
          <li key={b.id} className="flex items-center gap-2 py-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="break-words">{b.name}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="space-y-3">
        <Label htmlFor="business-name">Business name</Label>
        <Input
          id="business-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
          disabled={mutation.isPending}
        />
        <Button type="submit" variant="outline" disabled={mutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          {mutation.isPending ? "Saving…" : "Add business"}
        </Button>
        {message && (
          <p role="status" className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

function ConfigurationForm({
  workspaceId,
  businesses,
  onSaved,
}: {
  workspaceId: string;
  businesses: Business[];
  onSaved: () => Promise<unknown>;
}) {
  const saveConfiguration = useServerFn(saveEmailConfiguration);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const businessId = businesses.some((b) => b.id === selectedBusiness)
    ? selectedBusiness
    : (businesses[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: (data: ReturnType<typeof connectionInput.parse>) => saveConfiguration({ data }),
  });
  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const parsed = connectionInput.safeParse({
      workspaceId,
      businessId,
      email,
      provider: "namecheap",
      imapHost: "mail.privateemail.com",
      imapPort: 993,
      imapTls: true,
      smtpHost: "mail.privateemail.com",
      smtpPort: 465,
      smtpTls: true,
    });
    if (!parsed.success) {
      setMessage("Select a business and enter a valid mailbox email.");
      return;
    }
    try {
      const result = await mutation.mutateAsync(parsed.data);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setEmail("");
      setMessage("Configuration saved. Mailbox is not connected.");
      await onSaved();
    } catch {
      setMessage("Unable to save configuration right now.");
    }
  }
  return (
    <section aria-labelledby="configuration-heading">
      <h3 id="configuration-heading" className="mb-4 text-lg font-semibold">
        Namecheap Private Email
      </h3>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email-business">Business</Label>
          <Select
            value={businessId}
            onValueChange={setSelectedBusiness}
            disabled={!businessId || mutation.isPending}
          >
            <SelectTrigger id="email-business" className="mt-2">
              <SelectValue placeholder="Add a business first" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="mailbox-email">Mailbox email</Label>
          <Input
            id="mailbox-email"
            className="mt-2"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            required
            disabled={!businessId || mutation.isPending}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="imap-server">IMAP · SSL/TLS</Label>
            <Input id="imap-server" className="mt-2" value="mail.privateemail.com:993" readOnly />
          </div>
          <div>
            <Label htmlFor="smtp-server">SMTP · SSL/TLS</Label>
            <Input id="smtp-server" className="mt-2" value="mail.privateemail.com:465" readOnly />
          </div>
        </div>
        <div>
          <Label htmlFor="mailbox-password">Mailbox password</Label>
          <Input
            id="mailbox-password"
            className="mt-2"
            type="password"
            autoComplete="off"
            disabled
            aria-describedby="password-blocker"
          />
          <p id="password-blocker" className="mt-2 text-xs text-muted-foreground">
            Needs secure credential backend
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!businessId || mutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Saving…" : "Save configuration"}
          </Button>
          <Button variant="outline" disabled>
            Test connection
          </Button>
          <Button variant="outline" disabled>
            Sync
          </Button>
          <Button variant="outline" disabled>
            Send
          </Button>
        </div>
        {message && (
          <p role="status" className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
