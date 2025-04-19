const createResult = (err, data) => {
    if (data) {
        createSuccessResult(data)
    }
    else {
        createErrorResult(err)
    }
}

const createSuccessResult = (data) => {
    return { status: "success", data: data }
}

const createErrorResult = (err) => {
    return { status: "error", err: err }
}
