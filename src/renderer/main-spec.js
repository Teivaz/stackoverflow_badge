describe('Render', function() {
	var user = {
		badge_counts: {
			bronze: 22,
			silver: 8,
			gold: 2
		},
		account_id: 4071861,
		is_employee: false,
		last_modified_date: 1466863318,
		last_access_date: 1471434970,
		age: 29,
		reputation_change_year: 1055,
		reputation_change_quarter: 173,
		reputation_change_month: 173,
		reputation_change_week: 0,
		reputation_change_day: 0,
		reputation: 1387,
		creation_date: 1393198109,
		user_type: "registered",
		user_id: 3344612,
		location: "Poland",
		website_url: "",
		link: "http://stackoverflow.com/users/3344612/teivaz",
		profile_image: "https://www.gravatar.com/avatar/e0eb55a2f6c7279d27e7712db92629ac?s=128&d=identicon&r=PG",
		display_name: "teivaz"
	}

	var render = require('./main')
	it('basic render', function(done) {

		var template = '../../templates/badge-template.html'
		var format = 'png'
		render(user, template, format).then( (result) => {
			//'done: ' + result.type + ' | ' + result.data.length
			expect(result.error).toBe(null)
			expect(result.type).toBe('image/png')
			expect(result.data.length).toBeGreaterThan(10)
		}).catch( (e) => {
			fail(e)
		}).then(done)
	})
}, 40000);
