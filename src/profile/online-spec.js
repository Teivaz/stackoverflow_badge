describe('Profile: Online', function() {
	var online = require('./online')

	it('general stuff', function() {
		expect(online.quotaRemaining()).toBeGreaterThan(100)
		expect(online.generateUrl([123456])).toContain('123456')
		expect(online.generateUrl([123456,-1])).toContain('123456;-1')
	})

	it('download users', function(done) {
		expect(online.isPending()).toBe(false)
		expect(online.isTimeout()).toBe(false)
		online.downloadUsers([-1]).then( (users) => {
			expect(users.length).toEqual(1)
			var user = users[0]
			expect(user.user_id).toBe(-1)
			expect(user.display_name).toBe('Community')
			expect(user.reputation).toBe(1)
			expect(user.profile_image).toBe('https://www.gravatar.com/avatar/a007be5a61f6aa8f3e85ae2fc18dd66e?s=128&d=identicon&r=PG')
			expect(typeof user.badge_counts).toBe('object')
			expect(user.badge_counts.gold).toBe(0)
			expect(user.badge_counts.silver).toBe(0)
			expect(user.badge_counts.bronze).toBe(0)
		}).catch( (error) => {
			fail(error)
		}).then( () => {
			expect(online.isTimeout()).toBe(true)
			expect(online.isPending()).toBe(false)
			done()
		})
		expect(online.isPending()).toBe(true)
	})

	it('download 30 users', function(done) {
		var user_ids = [1,2,3,4,5,8,9,10,11,13,16,17,19,20,22,23,24,25,26,27,29,30,32,33,34,35,36,37,38,39]
		online.downloadUsers(user_ids).then( (users) => {
			expect(users.length).toEqual(user_ids.length)
		}).catch( (error) => {
			fail(error)
		}).then(done)
	})

	it('throttle error', function(done) {
		var online = require('./online')
		online.generateUrl = () => {return 'https://api.stackexchange.com/2.2/errors/502'}
		online.downloadUsers([]).then( (users) => {
			fail('should not resolve '+ JSON.stringify(users))
		}).catch( (error) => {
			expect(error.error_id).toBe(502)
			expect(error.error_name).toBe('throttle_violation')
			expect(online.isBackoff()).toBe(true)
		}).then(done)
		expect(online.isBackoff()).toBe(false)
	})
})
