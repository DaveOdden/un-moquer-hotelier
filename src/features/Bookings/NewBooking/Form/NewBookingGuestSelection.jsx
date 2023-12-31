import { AutoComplete, Form, Input } from 'antd'
import { useGuestAutoComplete } from 'src/hooks/useGuestsQuery'
import { onGuestSearch } from 'src/features/Bookings/utils/newBookingGuestSearch'
import { AppAPI } from 'src/api/API'
import { apiPaths } from 'src/api/constants'

export const NewBookingGuestSelection = (props) => {
	const guest = useGuestAutoComplete()
	const { setSelectedGuest, setGuestSearchHasResults } = props

	const onSearch = (query) => {
		setGuestSearchHasResults(onGuestSearch(query, guest.data))
	}

	const onGuestSelection = (value, data) => {
		AppAPI.call({
			method: 'GET',
			endpoint: apiPaths.guest,
			id: data.id,
		}).then((res) => {
			console.log(res)
			setSelectedGuest(res.message)
		})
	}

	return (
		<Form.Item
			name="guest"
			label="Guest"
			className="mt-8"
			rules={[
				{
					required: true,
					message: 'Select a guest',
				},
			]}>
			<AutoComplete
				options={guest.data}
				filterOption={true}
				onSearch={onSearch}
				onSelect={onGuestSelection}>
				<Input.Search
					placeholder={guest.isLoading ? 'Loading...' : 'Search by Name'}
					disabled={guest.isLoading}
				/>
			</AutoComplete>
		</Form.Item>
	)
}
