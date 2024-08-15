import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Container, Typography, Button, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import '@fullcalendar/common/main.css';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';



const ScheduleMeeting = () => {
    const [events, setEvents] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState('');
    const [duration, setDuration] = useState(30);
    const [mentors, setMentors] = useState([]);
    const [selectedAreaOfInterest, setSelectedAreaOfInterest] = useState('');
    const [selectionCriteria, setSelectionCriteria] = useState('field');
    const [areaOfInterests, setAreaOfInterests] = useState([]);
    const [scheduleTime, setScheduleTime] = useState(dayjs('2022-04-17T15:30'));

    useEffect(() => {
        const fetchAreaOfInterests = async () => {
            try {
                const response = await axios.get('http://localhost:3000/areas-of-interest');
                setAreaOfInterests(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching areas of interest:', error);
            }
        };
        fetchAreaOfInterests();
    }, []);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/mentors/`);
                setMentors(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching mentors:', error);
            }
        };
        fetchMentors();
    }, []);

    useEffect(() => {
        if (selectedMentor) {
            const fetchAvailability = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/get-availability/${selectedMentor}`);
                    const fetchedEvents = response.data.map(event => ({
                        id: event.id,
                        title: event.title,
                        start: event.start,
                        groupId: 'availableForMeeting',
                        end: event.end_time,
                        allDay: false,
                        editable:false,
                        display: 'inverse-background'
                    }));
                    setEvents(fetchedEvents);
                } catch (error) {
                    console.error('Error fetching availability:', error);
                }
            };
            fetchAvailability();
        }
    }, [selectedMentor]);

    const handleDateSelect = (selectInfo) => {
        const newEvent = {
            id: String(new Date().getTime()),
            title:"Meeting with Student",
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay,
        };
        setEvents([...events, newEvent]);
    };

    const handleSave = async () => {
        try {
            const mentor = selectionCriteria==='mentor' ? selectedMentor : ''; 
            await axios.post('/api/schedule', {
                studentId: 'student-id', // Example student ID
                mentorId: mentor,
                selectedField: selectedAreaOfInterest,
                duration,
            });
            alert('Scheduled the meeting successfully');
        } catch (error) {
            console.error('Error scheduling meeting:', error);
        }
    };

    const handleChangeCriteria = (criteria) => {
        setSelectionCriteria(criteria);
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Select Your Preferred Timings
            </Typography>
            <FormControl fullWidth margin="normal">
                <Select value={selectionCriteria}
                    onChange={(e) => handleChangeCriteria(e.target.value)}
                >
                    <MenuItem value="field">
                        Choose Field
                    </MenuItem>
                    <MenuItem value="mentor">
                        Choose Mentor (Premium)
                    </MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                {selectionCriteria ?
                    <InputLabel>{selectionCriteria === 'field' ? 'Area of Interest' : 'Select Mentor'}</InputLabel>
                    : ''}
                <Select
                    value={selectionCriteria === 'field' ? selectedAreaOfInterest : selectedMentor}
                    onChange={selectionCriteria === 'field' ?
                        (e) => setSelectedAreaOfInterest(e.target.value) :
                        (e) => setSelectedMentor(e.target.value)}>
                    {
                        selectionCriteria === 'field' ?
                            areaOfInterests.map((interest, index) => (
                                <MenuItem key={index} value={interest.area_of_interest}>
                                    {interest.area_of_interest}
                                </MenuItem>))
                            : mentors.map((mentor, index) => (
                                <MenuItem key={index} value={mentor.mentor_id}>
                                    {mentor.name}
                                </MenuItem>
                            ))
                    }
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>Duration (minutes)</InputLabel>
                <Select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                >
                    <MenuItem value={30}>30</MenuItem>
                    <MenuItem value={45}>45</MenuItem>
                    <MenuItem value={60}>60</MenuItem>
                </Select>
            </FormControl>
            {
                selectedMentor ?
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
                            events={events}
                            firstDay={1}
                            hiddenDays={[1, 2, 3, 4, 5]}
                            selectConstraint={events}
                            // selectOverlap= {(event)=>event.groupId==='availableForMeeting'}
                            select={handleDateSelect}
                        />
                    </Box>
                    :
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Controlled picker"
                            value={scheduleTime}
                            onChange={(newValue) => setScheduleTime(newValue)}
                        /></LocalizationProvider>}
            <Button variant="contained" color="primary" onClick={handleSave}>
                Schedule meeting
            </Button>
        </Container>
    );
};

export default ScheduleMeeting;
