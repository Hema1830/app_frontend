import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '../components/utils/Input'; // Import Textarea from utils/Input
import Loader from '../components/utils/Loader';
import useFetch from '../hooks/useFetch';
import MainLayout from '../layouts/MainLayout';
import validateManyFields from '../validations';

// Define Input component locally
const Input = ({ type, name, id, value, onChange }) => (
  <input
    type={type}
    name={name}
    id={id}
    value={value}
    onChange={onChange}
    className="border rounded-md p-2"
  />
);

// Define Select component locally
const Select = ({ name, id, value, onChange, children }) => (
  <select
    name={name}
    id={id}
    value={value}
    onChange={onChange}
    className="border rounded-md p-2"
  >
    {children}
  </select>
);

const Task = () => {
  const authState = useSelector(state => state.authReducer);
  const navigate = useNavigate();
  const [fetchData, { loading }] = useFetch();
  const { taskId } = useParams();
  
  const mode = taskId ? 'update' : 'add'; // Check if taskId exists to determine mode
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    dueDate: '',
    reminder: '',
    priority: 'medium',
    status: 'pending'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    document.title = mode === 'add' ? 'Add Task' : 'Edit Task';
  }, [mode]);

  useEffect(() => {
    if (mode === 'update' && taskId) {
      const config = { url: `/tasks/${taskId}`, method: 'get', headers: { Authorization: authState.token } };
      fetchData(config, { showSuccessToast: false }).then(data => {
        setTask(data.task);
        setFormData({
          description: data.task.description,
          dueDate: data.task.dueDate || '',
          reminder: data.task.reminder || '',
          priority: data.task.priority || 'medium',
          status: data.task.status || 'pending'
        });
      });
    }
  }, [mode, authState.token, taskId, fetchData]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = e => {
    e.preventDefault();
    if (task) {
      setFormData({
        description: task.description,
        dueDate: task.dueDate || '',
        reminder: task.reminder || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending'
      });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateManyFields('task', formData);
    setFormErrors({});

    if (errors.length > 0) {
      setFormErrors(errors.reduce((total, ob) => ({ ...total, [ob.field]: ob.err }), {}));
      return;
    }

    const config = {
      url: mode === 'add' ? '/tasks' : `/tasks/${taskId}`,
      method: mode === 'add' ? 'post' : 'put',
      data: formData,
      headers: { Authorization: authState.token }
    };

    fetchData(config).then(() => {
      navigate('/');
    });
  };

  const fieldError = field => (
    <p className={`mt-1 text-pink-600 text-sm ${formErrors[field] ? 'block' : 'hidden'}`}>
      <i className="mr-2 fa-solid fa-circle-exclamation"></i>
      {formErrors[field]}
    </p>
  );

  return (
    <MainLayout>
      <form className="m-auto my-16 max-w-[1000px] bg-white p-8 border-2 shadow-md rounded-md">
        {loading ? (
          <Loader />
        ) : (
          <>
            <h2 className="text-center mb-4">{mode === 'add' ? 'Add New Task' : 'Edit Task'}</h2>
            <div className="mb-4">
              <label htmlFor="description">Description</label>
              <Textarea
                type="description"
                name="description"
                id="description"
                value={formData.description}
                placeholder="Write here.."
                onChange={handleChange}
              />
              {fieldError('description')}
            </div>
            <div className="mb-4">
              <label htmlFor="dueDate">Due Date</label>
              <Input
                type="date"
                name="dueDate"
                id="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
              {fieldError('dueDate')}
            </div>
            <div className="mb-4">
              <label htmlFor="reminder">Reminder</label>
              <Input
                type="datetime-local"
                name="reminder"
                id="reminder"
                value={formData.reminder}
                onChange={handleChange}
              />
              {fieldError('reminder')}
            </div>
            <div className="mb-4">
              <label htmlFor="priority">Priority</label>
              <Select
                name="priority"
                id="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              {fieldError('priority')}
            </div>
            <div className="mb-4">
              <label htmlFor="status">Status</label>
              <Select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
              {fieldError('status')}
            </div>
            <button className="bg-primary text-white px-4 py-2 font-medium hover:bg-primary-dark" onClick={handleSubmit}>
              {mode === 'add' ? 'Add Task' : 'Update Task'}
            </button>
            <button className="ml-4 bg-red-500 text-white px-4 py-2 font-medium" onClick={() => navigate('/')}>
              Cancel
            </button>
            {mode === 'update' && (
              <button className="ml-4 bg-blue-500 text-white px-4 py-2 font-medium hover:bg-blue-600" onClick={handleReset}>
                Reset
              </button>
            )}
          </>
        )}
      </form>
    </MainLayout>
  );
};

export default Task;


