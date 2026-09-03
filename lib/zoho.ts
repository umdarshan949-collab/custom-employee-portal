import { prisma } from './prisma';

export interface ZohoServiceMeta {
  code: string;
  name: string;
  category: string;
  requiredPermission: string;
  color: string;
  iconName: string;
  description: string;
  externalUrl: string;
}

export const ZOHO_SERVICES: Record<string, ZohoServiceMeta> = {
  zoho_people: {
    code: 'zoho_people',
    name: 'Zoho People',
    category: 'Human Resources',
    requiredPermission: 'access:zoho_people',
    color: 'bg-emerald-600',
    iconName: 'Users',
    description: 'Centralized employee attendance, leave management, directory, and HR operations.',
    externalUrl: 'https://people.zoho.com',
  },
  zoho_crm: {
    code: 'zoho_crm',
    name: 'Zoho CRM',
    category: 'Sales & Marketing',
    requiredPermission: 'access:zoho_crm',
    color: 'bg-blue-600',
    iconName: 'Target',
    description: 'Manage sales pipelines, leads, customer interactions, and deal stages.',
    externalUrl: 'https://crm.zoho.com',
  },
  zoho_desk: {
    code: 'zoho_desk',
    name: 'Zoho Desk',
    category: 'Customer Support',
    requiredPermission: 'access:zoho_desk',
    color: 'bg-amber-600',
    iconName: 'HelpCircle',
    description: 'Customer support ticketing, SLA tracking, knowledge base, and desk analytics.',
    externalUrl: 'https://desk.zoho.com',
  },
  zoho_books: {
    code: 'zoho_books',
    name: 'Zoho Books',
    category: 'Finance & Accounting',
    requiredPermission: 'access:zoho_books',
    color: 'bg-indigo-600',
    iconName: 'CreditCard',
    description: 'Invoicing, expense reporting, financial statements, and ledger management.',
    externalUrl: 'https://books.zoho.com',
  },
};

// Check if live credentials are model-ready
export function isLiveZohoConfigured(): boolean {
  return (
    !!process.env.ZOHO_CLIENT_ID &&
    !!process.env.ZOHO_CLIENT_SECRET &&
    !!process.env.ZOHO_REFRESH_TOKEN
  );
}

export async function fetchZohoServiceData(serviceCode: string, userEmail: string) {
  if (isLiveZohoConfigured()) {
    try {
      return await fetchLiveZohoData(serviceCode);
    } catch (err) {
      console.warn(`Live Zoho API call failed for ${serviceCode}, falling back to sandbox mock data.`, err);
    }
  }

  // Return Mock / Sandbox Data
  return getMockZohoData(serviceCode, userEmail);
}

async function fetchLiveZohoData(serviceCode: string) {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';

  // 1. Get or Refresh Access Token
  let dbToken = await prisma.zohoToken.findUnique({ where: { service: serviceCode } });

  if (!dbToken || dbToken.expiresAt < new Date()) {
    const tokenUrl = `${accountsUrl}/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
    const res = await fetch(tokenUrl, { method: 'POST' });
    const data = await res.json();

    if (!res.ok || !data.access_token) {
      throw new Error(`Failed to refresh Zoho Token: ${JSON.stringify(data)}`);
    }

    const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);

    dbToken = await prisma.zohoToken.upsert({
      where: { service: serviceCode },
      update: { accessToken: data.access_token, expiresAt },
      create: {
        service: serviceCode,
        accessToken: data.access_token,
        refreshToken,
        expiresAt,
      },
    });
  }

  // 2. Fetch live data based on service
  const accessToken = dbToken.accessToken;
  const headers = { Authorization: `Zoho-oauthtoken ${accessToken}` };

  if (serviceCode === 'zoho_people') {
    const apiRes = await fetch('https://people.zoho.com/people/api/v2/employee', { headers });
    return await apiRes.json();
  } else if (serviceCode === 'zoho_crm') {
    const apiRes = await fetch('https://www.zohoapis.com/crm/v2/Leads', { headers });
    return await apiRes.json();
  } else if (serviceCode === 'zoho_desk') {
    const orgId = process.env.ZOHO_ORG_ID || '';
    const apiRes = await fetch('https://desk.zoho.com/api/v1/tickets', {
      headers: { ...headers, orgId },
    });
    return await apiRes.json();
  } else if (serviceCode === 'zoho_books') {
    const orgId = process.env.ZOHO_ORG_ID || '';
    const apiRes = await fetch(`https://books.zohoapis.com/books/v3/invoices?organization_id=${orgId}`, { headers });
    return await apiRes.json();
  }

  throw new Error(`Unsupported service: ${serviceCode}`);
}

function getMockZohoData(serviceCode: string, userEmail: string) {
  const timestamp = new Date().toISOString();

  switch (serviceCode) {
    case 'zoho_people':
      return {
        service: 'Zoho People',
        mode: 'Sandbox / Mock Mode',
        lastSynced: timestamp,
        summary: {
          totalEmployees: 148,
          activeOnLeave: 6,
          pendingLeaves: 3,
          upcomingHolidays: 2,
        },
        records: [
          { id: 'EMP-001', name: 'Sarah Jenkins', role: 'HR Lead', status: 'Active', leaveBalance: '18 Days', checkIn: '09:00 AM' },
          { id: 'EMP-002', name: 'Alex Rivera', role: 'Sales Specialist', status: 'Active', leaveBalance: '12 Days', checkIn: '08:45 AM' },
          { id: 'EMP-003', name: 'Michael Chang', role: 'Support Agent', status: 'On Leave', leaveBalance: '15 Days', checkIn: '-' },
          { id: 'EMP-004', name: 'David Vance', role: 'Financial Analyst', status: 'Active', leaveBalance: '20 Days', checkIn: '09:15 AM' },
          { id: 'EMP-005', name: 'Elena Rostova', role: 'Operations Manager', status: 'Active', leaveBalance: '14 Days', checkIn: '08:30 AM' },
        ],
        quickActions: ['Request Time Off', 'View Pay Stubs', 'Clock Out', 'Download HR Policy'],
      };

    case 'zoho_crm':
      return {
        service: 'Zoho CRM',
        mode: 'Sandbox / Mock Mode',
        lastSynced: timestamp,
        summary: {
          openDeals: 24,
          pipelineValue: '$485,000',
          conversionRate: '32.4%',
          leadsThisMonth: 82,
        },
        records: [
          { id: 'LEAD-901', client: 'Acme Corp', stage: 'Negotiation', dealValue: '$120,000', owner: 'Alex Rivera', probability: '80%' },
          { id: 'LEAD-902', client: 'Starlight Tech', stage: 'Qualification', dealValue: '$45,000', owner: 'Alex Rivera', probability: '40%' },
          { id: 'LEAD-903', client: 'Nexus Global', stage: 'Proposal Sent', dealValue: '$210,000', owner: 'Alex Rivera', probability: '65%' },
          { id: 'LEAD-904', client: 'Cyberdyne Systems', stage: 'Closed Won', dealValue: '$110,000', owner: 'Elena Rostova', probability: '100%' },
        ],
        quickActions: ['Create New Lead', 'Log Client Meeting', 'Generate Deal Report', 'Sync Pipeline'],
      };

    case 'zoho_desk':
      return {
        service: 'Zoho Desk',
        mode: 'Sandbox / Mock Mode',
        lastSynced: timestamp,
        summary: {
          openTickets: 12,
          unassigned: 2,
          avgResponseTime: '18 mins',
          csatScore: '94.8%',
        },
        records: [
          { id: 'TCK-4001', subject: 'SSO Authentication Error on Portal', priority: 'High', status: 'In Progress', assignee: 'Michael Chang', created: '10 mins ago' },
          { id: 'TCK-4002', subject: 'Payroll Payslip Export PDF Request', priority: 'Medium', status: 'Open', assignee: 'Unassigned', created: '1 hour ago' },
          { id: 'TCK-4003', subject: 'VPN Access Grant for New Intern', priority: 'Low', status: 'Resolved', assignee: 'Michael Chang', created: '4 hours ago' },
          { id: 'TCK-4004', subject: 'Zoho Books Expense Category Sync', priority: 'High', status: 'Pending Customer', assignee: 'Michael Chang', created: 'Yesterday' },
        ],
        quickActions: ['Submit Support Ticket', 'Knowledge Base Search', 'Escalate Ticket', 'CSAT Analytics'],
      };

    case 'zoho_books':
      return {
        service: 'Zoho Books',
        mode: 'Sandbox / Mock Mode',
        lastSynced: timestamp,
        summary: {
          monthlyRevenue: '$142,500',
          outstandingInvoices: '$28,400',
          expensesThisMonth: '$18,200',
          netMargin: '38.2%',
        },
        records: [
          { id: 'INV-8801', customer: 'Acme Enterprise', amount: '$34,500', status: 'Paid', dueDate: '2026-08-30' },
          { id: 'INV-8802', customer: 'Starlight Tech', amount: '$12,800', status: 'Overdue', dueDate: '2026-08-25' },
          { id: 'INV-8803', customer: 'Global Logistics', amount: '$15,600', status: 'Sent', dueDate: '2026-09-10' },
          { id: 'INV-8804', customer: 'Vortex Media', amount: '$8,900', status: 'Paid', dueDate: '2026-09-01' },
        ],
        quickActions: ['New Invoice', 'Log Expense', 'Export P&L Report', 'Tax Summary'],
      };

    default:
      return { error: 'Unknown Zoho Application Service Code' };
  }
}
