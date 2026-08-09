import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

function SubmitTimesheet() {
  const [date, setDate] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('date', date);
    formData.append('hours_worked', hoursWorked);
    formData.append('notes', notes);
    if (file) formData.append('attachment', file);

    try {
      await api.post('/timesheets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      const detail = err.response?.data;
      if (detail?.non_field_errors) {
        setError('You already submitted a timesheet for this date.');
      } else {
        setError('Could not submit timesheet. Check the fields and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h2 style={{ marginBottom: 20 }}>Submit Timesheet</h2>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Hours Worked" type="number" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} />

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Attachment (optional)</label>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
          {success && <p style={{ color: 'green', fontSize: 13 }}>Submitted! Redirecting...</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Timesheet'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default SubmitTimesheet;