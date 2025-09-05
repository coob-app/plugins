function main()
    local isCorrect = false

    local settings = bx_state.component._settings or {}
    local completedMessages = settings.completedMessages or {
        success = "You did a great job!",
        wrong = "Sorry, you are wrong."
    }

    local results = bx_state.request.results or {
        percentage = 0
    }
    local percentage = results.percentage or 0

    if percentage >= (settings.passingScore or 70) then
        isCorrect = true
        return isCorrect, completedMessages.success
    end

    return isCorrect, completedMessages.wrong
end