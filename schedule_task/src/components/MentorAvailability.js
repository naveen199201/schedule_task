import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Container, Typography, Button, Box } from '@mui/material';
import '@fullcalendar/common/main.css'; // Import FullCalendar styles

const MentorAvailability = () => {
    const [events, setEvents] = useState([]);
    const mentorId = "339dd18c-3c6c-411c-a55f-771995f2bb24";

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/get-availability/${mentorId}`);
                const fetchedEvents = response.data.map(event => ({
                    id: event.id,
                    title: event.title,
                    start: event.start,
                    end: event.end_time,
                    allDay: false, // Assuming events are not all-day events
                }));
                console.log("Fetched Events:", fetchedEvents);

                setEvents(fetchedEvents);
            } catch (error) {
                console.error('Error fetching availability:', error);
            }
        };

        fetchAvailability();
    }, [mentorId]);

    const handleDateSelect = (selectInfo) => {
        let title = prompt('Enter a title for this time slot (e.g., "Available")');
        let calendarApi = selectInfo.view.calendar;

        calendarApi.unselect(); // Clear the selection

        if (title) {
            const newEvent = {
                id: String(new Date().getTime()), // Unique ID for each event
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay,
            };

            setEvents([...events, newEvent]);
        }
    };

    const handleEventClick = (clickInfo) => {
        if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
            clickInfo.event.remove();
            setEvents(events.filter(event => event.id !== clickInfo.event.id));
        }
    };

    const handleEventAdd = (addInfo) => {
        console.log('Event added:', addInfo.event);
    };

    const handleSave = () => {
        axios.post('http://localhost:3000/mentor/mentor_availability', { events, mentorId })
            .then(response => {
                console.log('Availability saved successfully:', response.data);
            })
            .catch(error => {
                console.error('Error saving availability:', error);
            });
    };

    const filterEvents = (events) => {
        return events.filter(event => {
            const startDate = new Date(event.start);
            const day = startDate.getDay();
            
            return day === 6 || day === 0;
        });
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Select Your Preferred Timings
            </Typography>
            <Box mb={3}>
                <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    initialView="timeGridWeek"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    events={filterEvents(events)}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    eventAdd={handleEventAdd}
                    hiddenDays={[1, 2, 3, 4, 5]}
                    visibleRange={(currentDate) => {
                        const start = new Date(currentDate.valueOf());
                        start.setDate(start.getDate() - start.getDay() + 1); // Move to Monday
                        const end = new Date(start);
                        end.setDate(end.getDate() + 6); // End at Sunday
                        return { start, end };
                    }}
                />
            </Box>
            <Button variant="contained" color="primary" onClick={handleSave}>
                Save Availability
            </Button>
        </Container>
    );
};

export default MentorAvailability;
