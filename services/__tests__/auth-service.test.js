import { sum } from "../auth-service.js"

describe('sum.js',
    () => {
        test('add two', () => {
        const res = sum(1,2)
            expect(res).toBe(3)
        })
    }
)
