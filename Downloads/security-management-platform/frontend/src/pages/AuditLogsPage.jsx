function AuditLogsPage({ role }) {
  if (role !== 'ADMIN') {
    return (
      <section className="page-panel">
        <div className="empty-state">
          <h2>Access restricted</h2>
          <p>Audit log access is limited to administrators.</p>
        </div>
      </section>
    );
  }

  const auditRows = [
    { actor: 'system', action: 'Tenant sync completed', time: 'Today, 09:10 AM' },
    { actor: 'admin@tenanta.com', action: 'Campaign updated: Summer Security Drive', time: 'Yesterday, 04:35 PM' },
    { actor: 'manager@tenanta.com', action: 'User assigned to campaign', time: 'Yesterday, 12:15 PM' },
    { actor: 'system', action: 'Security event status changed to INVESTIGATING', time: 'Mon, 08:20 AM' },
  ];

  return (
    <section className="page-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Audit logs</p>
          <h2>Administrative activity</h2>
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {auditRows.map((entry, index) => (
              <tr key={`${entry.actor}-${index}`}>
                <td>{entry.actor}</td>
                <td>{entry.action}</td>
                <td>{entry.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AuditLogsPage;
