describe('Profile: Database', function() {
	var db = require('./database')

	var user1 = {
		badge_counts: {
			bronze: 0,
			silver: 0,
			gold: 0
		},
		account_id: -1,
		is_employee: false,
		reputation_change_year: 0,
		reputation_change_quarter: 0,
		reputation_change_month: 0,
		reputation_change_week: 0,
		reputation_change_day: 0,
		reputation: 1,
		creation_date: 1217462400,
		user_type: "moderator",
		user_id: -1,
		location: "on the server farm",
		website_url: "http://meta.stackexchange.com/",
		link: "http://stackoverflow.com/users/-1/community",
		profile_image: "https://www.gravatar.com/avatar/a007be5a61f6aa8f3e85ae2fc18dd66e?s=128&d=identicon&r=PG",
		display_name: "Community"
	}

	var user2 = {
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

	it('save users', function(done) {
		db.saveUsers([user1]).then( () => {
			// ok
		}).catch( () => {
			fail('should never fail')
		}).then(done)
	})
	it('has user', function(done) {
		db.hasUser(user1.user_id).then( () => {
			// ok
		}).catch( () => {
			fail('user should exist')
		}).then(done)
	})
	it('get existing user', function(done) {
		db.getUser(user1.user_id).then( (resp) => {
			expect(JSON.stringify(resp)).toBe(JSON.stringify(user1))
		}).catch( () => {
			fail('should never fail')
		}).then(done)
	})
	it('get non-existing user', function(done) {
		db.getUser(user2.user_id).then( (resp) => {
			fail('this user should not be in database')
		}).catch( () => {
			// ok
		}).then(done)
	})
	it('get users to update', function(done) {
		db.saveUsers([user2]).then( () => {
			db.getUsersToUpdate(1).then( (users) => {
				expect(users.length).toBe(1)
				expect(users[0]).toBe(user1.user_id)
			}).catch( () => {
				fail('should never fail')
			}).then(done)
		})
	})
})