import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { adminDepartments, adminDoctors, opdMetrics } from '../../data/mockData';

export function AdminPanelPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Hospital Operations"
        description="Manage doctors, departments, and monitor OPD throughput in one interface."
      />

      <section className="metrics-grid">
        <Card title="Active Patients">
          <p className="metric-value">{opdMetrics.activePatients}</p>
        </Card>
        <Card title="Consultations Completed">
          <p className="metric-value">{opdMetrics.consultationsCompleted}</p>
        </Card>
        <Card title="Avg Turnaround">
          <p className="metric-value">{opdMetrics.avgTurnaroundMin} min</p>
        </Card>
        <Card title="AI Summary Coverage">
          <p className="metric-value">{opdMetrics.aiSummaryCoverage}%</p>
        </Card>
      </section>

      <Card title="Manage Doctors" subtitle="Availability and assignment status">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {adminDoctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.name}</td>
                <td>{doctor.department}</td>
                <td>
                  <Badge tone={doctor.status === 'On Duty' ? 'success' : 'warning'}>{doctor.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Manage Departments" subtitle="Capacity and wait-time snapshot">
        <div className="department-grid">
          {adminDepartments.map((department) => (
            <article key={department.name} className="department-card">
              <h4>{department.name}</h4>
              <p>Doctors: {department.doctors}</p>
              <p>Average Wait: {department.avgWait} mins</p>
            </article>
          ))}
        </div>
      </Card>

      <Card title="Monitor OPD Flow">
        <ul className="opd-flow-list">
          {adminDepartments.map((department) => (
            <li key={`flow-${department.name}`}>
              <div>
                <p>{department.name}</p>
                <small>{department.avgWait} min average wait</small>
              </div>
              <progress max={40} value={department.avgWait} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
