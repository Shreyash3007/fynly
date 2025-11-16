/**
 * Trivial unit test to confirm Jest is working
 */
describe('Jest Setup', () => {
  it('should pass a basic arithmetic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('Fynly'.toLowerCase()).toBe('fynly')
  })
})
