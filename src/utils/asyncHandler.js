//this is basically a higher order function which will take a function as argument and return a function 
// It wraps async route handlers to catch errors and pass them to the next middleware

const asyncHandler = (func) => {
    return (req, res, next) => {
        const promise = Promise.resolve(func(req, res, next))
        promise.catch((err) => next(err))
    }
}

export { asyncHandler }


