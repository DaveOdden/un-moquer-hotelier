import { useState } from 'react'
import { useCreateBooking, useUpdateBooking, useDeleteBooking } from 'src/hooks/useBookingsQuery'
import ErrorBoundary from 'antd/es/alert/ErrorBoundary'
import { FeatureWrapper } from 'src/components/FeatureWrapper'
import { BookingsTable } from './BookingsTable'
import BookingDetail from './BookingsDetail/Index'
import NewBookingContainer from './NewBooking/Index'
import { useAllFeatures } from 'src/hooks/useAllQuery'
import { INITIAL_FORM_STATE } from 'src/utils/constants'

export default function Bookings(props) {
	const [guests, bookings, rooms] = useAllFeatures()
	const { mutate: addBooking } = useCreateBooking()
	const { mutate: modifyBooking } = useUpdateBooking()
	const { mutate: removeBooking } = useDeleteBooking()

	const dataIsLoading = [guests, bookings, rooms].some((query) => query.isPending)
	const allDataFetched = [guests, bookings, rooms].every((query) => query.isSuccess)
	const error = [guests, bookings, rooms].some((query) => query.error)

	const [newBookingFormStatus, setNewBookingFormStatus] = useState(INITIAL_FORM_STATE)
	const [editBookingFormStatus, setEditBookingFormStatus] = useState(INITIAL_FORM_STATE)
	const [selectedBookingId, setSelectedBookingId] = useState(null)
	const [fullBookingDetails, setFullBookingDetails] = useState(null)
	const [searchValue, setSearchValue] = useState('')
	const [toastNotification, setToastNotification] = useState({
		message: null,
		type: null,
	})

	const createBooking = (formData) => {
		setNewBookingFormStatus({
			loading: true,
			response: null,
			error: null,
			pristine: false,
		})
		addBooking(formData, {
			onSettled: (response) => onCreateSettled(response),
		})
	}

	const onCreateSettled = (response) => {
		setTimeout(() => {
			setNewBookingFormStatus({
				loading: false,
				response: response.success ? true : null,
				error: response.success ? null : true,
				pristine: false,
			})
		}, 1200)
		popToast(response)
	}

	const updateBooking = (newData) => {
		setEditBookingFormStatus({
			loading: true,
			response: null,
			error: null,
			pristine: false,
		})
		modifyBooking(newData, {
			onSettled: (response) => onUpdateSettled(response),
		})
	}

	const onUpdateSettled = (response) => {
		setEditBookingFormStatus({
			loading: false,
			response: response.success ? true : null,
			error: response.success ? null : true,
			pristine: false,
		})
		popToast(response)
	}

	const deleteBooking = (id) => {
		removeBooking(id, {
			onSettled: (response) => onDeleteSettled(response),
		})
	}

	const onDeleteSettled = (res) => {
		popToast(res)
		res.success ? setTimeout(setSelectedRecord(null), 800) : null
	}

	const popToast = (response) => {
		setToastNotification({
			message:
				response.message ||
				`${response.status ? `${response.status}` : ''} Error: Something Went Wrong`,
			type: response.success ? 'success' : 'error',
		})
	}

	const resetEditForm = () => setEditBookingFormStatus(INITIAL_FORM_STATE)

	return (
		<ErrorBoundary>
			<FeatureWrapper
				toastNotification={toastNotification}
				newRecordComponent={<NewBookingContainer submitFn={createBooking} />}
				subHeaderProps={{
					featureName: 'Bookings',
					recordCount: 0,
					newRecordBtn: true,
					newRecordStatus: newBookingFormStatus,
					search: (e) => setSearchValue(e.target.value),
				}}>
				<BookingsTable
					guests={guests}
					bookings={bookings}
					rooms={rooms}
					searchTerms={searchValue}
					onRowClick={(record) => {
						setFullBookingDetails(record)
						setSelectedBookingId(record._id)
					}}
				/>
				<BookingDetail
					bookingId={selectedBookingId}
					fullBookingDetails={fullBookingDetails}
					updateBooking={updateBooking}
					deleteBooking={deleteBooking}
					formStatus={editBookingFormStatus}
					resetEditForm={resetEditForm}
					showDrawer={() => selectedBookingId !== null}
					hideDrawer={() => setSelectedBookingId(null)}
				/>
			</FeatureWrapper>
		</ErrorBoundary>
	)
}
