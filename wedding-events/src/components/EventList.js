// src/components/EventList.js
import React from 'react';

const EventList = ({ events, onDelete }) => {
  return (
    <div>
      <h2>Wedding Schedule</h2>
      {events.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#4a3f35' }}>
          No events planned yet
        </p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event._id}>
              <span>
                {event.eventName} - {event.personName} -{' '}
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })} {' '}
                {(event.maleGuests > 0 || event.femaleGuests > 0) && 
                  `(+${event.maleGuests}M/${event.femaleGuests}F)`}
              </span>
              <button onClick={() => onDelete(event._id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventList;