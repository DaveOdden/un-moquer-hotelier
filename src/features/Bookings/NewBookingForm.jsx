import React, { useState, useEffect, useRef } from 'react';
import { GuestAPI } from '../../api/GuestAPI'
import { BookingsAPI } from '../../api/BookingsAPI'
import NewGuestForm from '../Guests/NewGuestForm'
import NewGuestPrompt from './NewGuestPrompt'
import { AutoComplete, Space, Flex, Form, Input, Button, DatePicker, TimePicker, Typography, Carousel, Descriptions, Divider, Statistic } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
const { Text, Title } = Typography;
import dayjs from 'dayjs';

export default function NewBookingForm(props) {
  const roomRate = 140;
  const carouselRef = useRef()

  /* Guest States */
  const [guests, setGuests] = useState([]); // unused (general store)
  const [guestsKeyValueSet, setGuestsForAutoComplete] = useState([]);
  const [guestIsLoading, setGuestLoadingState] = useState(true);
  const [guestSearchHasNoMatch, setGuestSearchHasNoMatch] = useState(false);
  const [guestSelected, setGuestSelected] = useState(false);
  const [showNewGuestForm, toggleNewGuestForm] = useState(false);

  /* Date / Time States */
  const [checkinDate, setCheckinDate] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [checkinTime, setCheckinTime] = useState(dayjs('12:00'));
  const [checkoutTime, setCheckoutTime] = useState(dayjs('10:30'));
  const [durationOfStay, setDurationOfStay] = useState(0);

  /* Room States */
  const [rooms, setRooms] = useState([]);
  const [roomIsLoading, setRoomLoadingState] = useState(true);
  const [showRoomSelection, setShowRoomSelection] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(-1)

  const getGuestData = () => {
    GuestAPI.get('keyvaluepair').then((res) => {
      setGuests(res.message)
      setGuestsForAutoComplete(res.keyvalpair)
      setGuestLoadingState(false)
    })
  }

  const onGuestSearch = (query) => {
    let hasMatch = false;
    for (const el of guestsKeyValueSet) {
      let hasValueMatch, hasLabelMatch = false;
      hasLabelMatch = el.label.indexOf(query) !== -1 ? true : false
      hasValueMatch = el.value.indexOf(query) !== -1 ? true : false
      if(hasLabelMatch || hasValueMatch) {
        hasMatch = true
        break;
      }
    }
    if(!hasMatch) {
      setGuestSearchHasNoMatch(true)
      setGuestSelected(false)
      setShowRoomSelection(false)
    } else if(hasMatch && guestSearchHasNoMatch) {
      setGuestSearchHasNoMatch(false)
    }
  }

  const onGuestSelection = () => {
    setGuestSelected(true)
  }

  const calculateDuration = (checkinDate, checkoutDate) => {
    setDurationOfStay(checkoutDate.diff(checkinDate, "days"))
  }

  const onCheckinDateSelection = (val) => {
    if( val ) {
      setCheckinDate(val)
      if(checkoutDate && checkinDate) {
        BookingsAPI.getRoomsByAvailability(checkinDate, checkoutDate).then((res) => {
          console.log(res);
        })
      }
    }
  }

  const onCheckoutDateSelection = (val) => {
    if( val ) {
      setCheckoutDate(val)
      if(checkinDate) {
        let $checkinDate = dayjs(checkinDate);
        let $checkoutDate = dayjs(val);
        setRoomLoadingState(true)
        BookingsAPI.getRoomsByAvailability($checkinDate.format('YYYY-MM-DD'), $checkoutDate.format('YYYY-MM-DD')).then((res) => {
          setShowRoomSelection(true)
          calculateDuration($checkinDate,$checkoutDate)
          setRooms(res.message.roomsWithAvailabilityKeyVal)
          setRoomLoadingState(false)
        })
      }
    }
  }

  const onRoomSelectionChange = (val) => {
    if(val === '')
      setSelectedRoom(-1)
  }

  const onRoomSelection = (val) => {
    setSelectedRoom(val)
  }

  useEffect(() => getGuestData, [])

  return (
    <>
      <Carousel ref={carouselRef}>
        <div>
          <Form id="bookingForm" onFinish={props.submitFn}>
            <Form.Item name="name" label="Guest" style={{marginTop: '32px'}}>
              <AutoComplete
                options={guestsKeyValueSet}
                filterOption={true}
                onSearch={onGuestSearch}
                onSelect={onGuestSelection}
              >
                <Input.Search placeholder="Search By Name" />
              </AutoComplete>
            </Form.Item>
            { guestSearchHasNoMatch && <NewGuestPrompt toggleNewGuestForm={toggleNewGuestForm} /> }
            { guestSelected && 
              <>
                <Space>
                  <Form.Item name="checkinDate" label="CheckIn Date">
                    <DatePicker
                      onChange={onCheckinDateSelection}
                    />
                  </Form.Item>
                  <Form.Item name="checkinTime" label="Checkin Time">
                    <TimePicker 
                      use12Hours 
                      minuteStep={15} 
                      defaultValue={dayjs('12:00', 'HH:mm')} 
                      format="h:mm a"
                      onSelect={(val) => setCheckinTime(val)}
                    />
                  </Form.Item>
                </Space>
                <Space>
                  <Form.Item name="checkoutDate" label="Checkout Date">
                    <DatePicker 
                      onChange={onCheckoutDateSelection}
                    />
                  </Form.Item>
                  <Form.Item name="checkoutTime" label="Checkout Time">
                    <TimePicker 
                      use12Hours 
                      minuteStep={15} 
                      defaultValue={dayjs('10:30', 'HH:mm')} 
                      format="h:mm a"
                      onSelect={(val) => setCheckoutTime(val)}
                    />
                  </Form.Item>
                </Space> 
                { showRoomSelection && !roomIsLoading &&
                  <>
                    <Form.Item name="rooms" label={`Rooms ${rooms.length ? `(${rooms.length})` : ''}`}>
                      <AutoComplete
                        options={rooms}
                        filterOption={true}
                        onSelect={onRoomSelection}
                        onChange={onRoomSelectionChange}
                      />
                    </Form.Item>
                    <Form.Item style={{textAlign: 'right', marginBottom: '0'}}>
                      <Button 
                        type="primary" 
                        key="submit" 
                        htmlType="submit" 
                        disabled={selectedRoom === -1}
                        onClick={()=>carouselRef.current.goTo(1)}
                      >
                        Next
                      </Button>
                    </Form.Item>
                  </>
                }
              </>
            }
          </Form>
        </div>
        <div>
          <Space direction="vertical">
            <Descriptions 
              size="small"
              style={{marginTop: '16px', display: 'flex', justifyContent: 'flex-end'}} 
              column={1}
            >
              <Descriptions.Item label="Guest Name">{guestSelected.firstName}</Descriptions.Item>
              <Descriptions.Item label="License #">70001011</Descriptions.Item>
              <Descriptions.Item label="Check In">{dayjs(checkinDate).format('dddd - MMMM DD, YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Check Out">{dayjs(checkoutDate).format('dddd - MMMM DD, YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Payment">Mock Payment</Descriptions.Item>
            </Descriptions>
            <Divider style={{margin: 0}}/>
            <Flex justify="space-between">
            <Descriptions column={1}>
              <Descriptions.Item label="Rate">${roomRate} x {durationOfStay}</Descriptions.Item></Descriptions>
              <Statistic title="Total" style={{textAlign: 'right', marginBottom: '32px'}} value={`$${roomRate*durationOfStay}`} />
            </Flex>
          </Space>
          <Flex justify="space-between">
            <Button onClick={() => carouselRef.current.goTo(0)}>Back</Button>
            <Button type="primary">Confirm Booking</Button>
          </Flex>
        </div>
      </Carousel>
      { showNewGuestForm && 
        <>
          <Button 
            type="link"
            icon={<ArrowLeftOutlined />} 
            onClick={() => {toggleNewGuestForm(false);setGuestSearchHasNoMatch(false);}}
            size="small"
          >
            Back to Booking Form
          </Button>
          <NewGuestForm submitFn={() => {}} />
        </>
      }
    </>
  )
}