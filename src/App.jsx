import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, Search, Trash2, Edit2, X, Check } from 'lucide-react';

export default function EventAttendeeDatabase() {
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAttendeeForm, setShowAttendeeForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    location: '',
    description: ''
  });

  const [attendeeForm, setAttendeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const eventsResult = await window.storage.get('events');
      const attendeesResult = await window.storage.get('attendees');
      
      if (eventsResult) {
        setEvents(JSON.parse(eventsResult.value));
      }
      if (attendeesResult) {
        setAttendees(JSON.parse(attendeesResult.value));
      }
    } catch (error) {
      console.log('No existing data found, starting fresh');
    }
  };

  const saveEvents = async (updatedEvents) => {
    try {
      await window.storage.set('events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  };

  const saveAttendees = async (updatedAttendees) => {
    try {
      await window.storage.set('attendees', JSON.stringify(updatedAttendees));
      setAttendees(updatedAttendees);
    } catch (error) {
      console.error('Failed to save attendees:', error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const newEvent = {
      id: Date.now().toString(),
      ...eventForm,
      createdAt: new Date().toISOString()
    };
    await saveEvents([...events, newEvent]);
    setEventForm({ name: '', date: '', location: '', description: '' });
    setShowEventForm(false);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const updatedEvents = events.map(evt => 
      evt.id === editingEvent.id ? { ...evt, ...eventForm } : evt
    );
    await saveEvents(updatedEvents);
    setEventForm({ name: '', date: '', location: '', description: '' });
    setEditingEvent(null);
    setShowEventForm(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirm('Are you sure you want to delete this event? All attendee registrations will be removed.')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      const updatedAttendees = attendees.filter(a => a.eventId !== eventId);
      await saveEvents(updatedEvents);
      await saveAttendees(updatedAttendees);
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
    }
  };

  const handleRegisterAttendee = async (e) => {
    e.preventDefault();
    const newAttendee = {
      id: Date.now().toString(),
      eventId: selectedEvent.id,
      ...attendeeForm,
      registeredAt: new Date().toISOString()
    };
    await saveAttendees([...attendees, newAttendee]);
    setAttendeeForm({ firstName: '', lastName: '', email: '', phone: '', organization: '' });
    setShowAttendeeForm(false);
  };

  const handleDeleteAttendee = async (attendeeId) => {
    if (confirm('Are you sure you want to remove this attendee?')) {
      const updatedAttendees = attendees.filter(a => a.id !== attendeeId);
      await saveAttendees(updatedAttendees);
    }
  };

  const getEventAttendees = (eventId) => {
    return attendees.filter(a => a.eventId === eventId);
  };

  const filteredAttendees = selectedEvent 
    ? getEventAttendees(selectedEvent.id).filter(a => 
        `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const startEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      date: event.date,
      location: event.location,
      description: event.description
    });
    setShowEventForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Astral Solutions Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Event Attendee Database</h1>
                <p className="text-sm text-gray-600">Astral Solutions - Extraterrestrial Innovations</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowEventForm(true);
                setEditingEvent(null);
                setEventForm({ name: '', date: '', location: '', description: '' });
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              New Event
            </button>
          </div>

          {showEventForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Name</label>
                      <input
                        type="text"
                        required
                        value={eventForm.name}
                        onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={eventForm.date}
                        onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        type="text"
                        required
                        value={eventForm.location}
                        onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={eventForm.description}
                        onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                        rows="3"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEventForm(false);
                        setEditingEvent(null);
                      }}
                      className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <div
                key={event.id}
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  selectedEvent?.id === event.id 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{event.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditEvent(event);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">{event.location}</p>
                <div className="flex items-center gap-2 mt-3 text-indigo-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {getEventAttendees(event.id).length} registered
                  </span>
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No events yet. Create your first event to get started!</p>
            </div>
          )}
        </div>

        {selectedEvent && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedEvent.name}</h2>
                <p className="text-gray-600">
                  {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.location}
                </p>
              </div>
              <button
                onClick={() => setShowAttendeeForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="w-5 h-5" />
                Register Attendee
              </button>
            </div>

            {showAttendeeForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Register Attendee</h2>
                    <button onClick={() => setShowAttendeeForm(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleRegisterAttendee}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">First Name</label>
                          <input
                            type="text"
                            required
                            value={attendeeForm.firstName}
                            onChange={(e) => setAttendeeForm({...attendeeForm, firstName: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Last Name</label>
                          <input
                            type="text"
                            required
                            value={attendeeForm.lastName}
                            onChange={(e) => setAttendeeForm({...attendeeForm, lastName: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={attendeeForm.email}
                          onChange={(e) => setAttendeeForm({...attendeeForm, email: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          value={attendeeForm.phone}
                          onChange={(e) => setAttendeeForm({...attendeeForm, phone: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Organization</label>
                        <input
                          type="text"
                          value={attendeeForm.organization}
                          onChange={(e) => setAttendeeForm({...attendeeForm, organization: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Register
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAttendeeForm(false)}
                        className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border rounded-lg pl-10 pr-4 py-2"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Organization</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAttendees.map(attendee => (
                    <tr key={attendee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {attendee.firstName} {attendee.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm">{attendee.email}</td>
                      <td className="px-4 py-3 text-sm">{attendee.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm">{attendee.organization || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(attendee.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteAttendee(attendee.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAttendees.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No attendees registered yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}