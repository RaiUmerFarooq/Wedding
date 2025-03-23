// src/components/GuestContributions.js
import React, { useState, useEffect } from 'react';
import '../App.css';

const GuestContributions = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [contributions, setContributions] = useState([
    { amount: '', description: '', createdAt: null },
    { amount: '', description: '', createdAt: null },
    { amount: '', description: '', createdAt: null },
  ]);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
      setError(null);
    } catch (error) {
      console.error('Fetch events error:', error);
      setError('Could not load events. Please try again.');
    }
  };

  const fetchContributions = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contributions/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch contributions');
      const data = await response.json();
      const fetchedContributions = data.contributions || [];
      const paddedContributions = fetchedContributions.map(contrib => ({
        amount: contrib.amount !== undefined ? contrib.amount.toString() : '',
        description: contrib.description || '',
        createdAt: contrib.createdAt || null,
      }));
      while (paddedContributions.length < 3) {
        paddedContributions.push({ amount: '', description: '', createdAt: null });
      }
      setContributions(paddedContributions.slice(0, 3));
      setError(null);
    } catch (error) {
      console.error('Fetch contributions error:', error);
      setError('Could not load contributions. Please try again.');
      setContributions([
        { amount: '', description: '', createdAt: null },
        { amount: '', description: '', createdAt: null },
        { amount: '', description: '', createdAt: null },
      ]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSelectedEvent(null);
    setContributions([
      { amount: '', description: '', createdAt: null },
      { amount: '', description: '', createdAt: null },
      { amount: '', description: '', createdAt: null },
    ]);
    setError(null);
  };

  const filteredEvents = events.filter(event =>
    event.personName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGuestSelect = (event) => {
    setSelectedEvent(event);
    fetchContributions(event._id);
  };

  const handleContributionChange = (index, field, value) => {
    const newContributions = [...contributions];
    newContributions[index][field] = field === 'amount' ? value.replace(/[^0-9]/g, '') : value;
    setContributions(newContributions);
  };

  const handleSave = async () => {
    if (!selectedEvent) {
      setError('Please select a guest first.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent._id,
          contributions: contributions.map(c => ({
            amount: c.amount ? parseInt(c.amount, 10) : 0,
            description: c.description || '',
            createdAt: c.createdAt || new Date().toISOString(),
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save contributions');
      }

      const savedData = await response.json();
      const updatedContributions = savedData.contributions.map(contrib => ({
        amount: contrib.amount !== undefined ? contrib.amount.toString() : '',
        description: contrib.description || '',
        createdAt: contrib.createdAt,
      }));
      while (updatedContributions.length < 3) {
        updatedContributions.push({ amount: '', description: '', createdAt: null });
      }
      setContributions(updatedContributions.slice(0, 3));
      setError(null);
      alert('Contributions saved successfully!');
    } catch (error) {
      console.error('Save contributions error:', error);
      setError(error.message || 'Error saving contributions. Please try again.');
    }
  };

  return (
    <div className="guest-contributions">
      <h1 className="page-title">Guest Contributions</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search guest by name..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      {searchTerm && !selectedEvent && (
        <ul className="guest-dropdown">
          {filteredEvents.map(event => (
            <li key={event._id} onClick={() => handleGuestSelect(event)} className="guest-item">
              <span className="guest-name">{event.personName}</span>
              <span className="guest-info">({event.eventName}, {event.location})</span>
            </li>
          ))}
          {filteredEvents.length === 0 && <li className="no-results">No guests found</li>}
        </ul>
      )}
      {selectedEvent && (
        <div className="contribution-section">
          <h2 className="contribution-title">
            Contributions for {selectedEvent.personName} ({selectedEvent.eventName}, {selectedEvent.location})
          </h2>
          <div className="contribution-grid">
            {contributions.map((contrib, index) => (
              <div key={index} className="contribution-card">
                <input
                  type="text"
                  placeholder="Amount (PKR)"
                  value={contrib.amount}
                  onChange={(e) => handleContributionChange(index, 'amount', e.target.value)}
                  className="amount-input"
                />
                <textarea
                  placeholder="e.g., Cash for Nikkah"
                  value={contrib.description}
                  onChange={(e) => handleContributionChange(index, 'description', e.target.value)}
                  className="description-input"
                />
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="save-button">Save Contributions</button>
        </div>
      )}
    </div>
  );
};

export default GuestContributions;