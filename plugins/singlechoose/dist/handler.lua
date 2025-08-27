function main()
    local message = "Answer is required"

    -- Проверка и установка значений по умолчанию для компонентов
    local options = bx_state.component.options or {}
    local answer = bx_state.request.answer
    local settings = bx_state.component._settings or {}
    local isIgnoreErrorAnswer = settings.isIgnoreErrorAnswer or false
    local completedMessages = settings.completedMessages or {
        success = "Correct answer!",
        wrong = "Incorrect answer. Please try again."
    }

    -- Проверяем, предоставлен ли ответ
    if not answer then
        return false, message
    end

    -- Увеличиваем индекс ответа, предполагая, что ответ является индексом
    answer = answer + 1

    -- Проверяем индекс ответа на валидность
    if not options[answer] then
        return false, "Answer is invalid"
    end

    local messageType = "wrong"
    local isCorrect = false
    -- Проверяем, правильный ли ответ
    if options[answer].isCorrect then
        isCorrect = true
        message = completedMessages.success
        messageType = "success"
    else
        -- Проверяем наличие объяснения для неправильного ответа
        if not options[answer].explanation or options[answer].explanation == "" then
            message = completedMessages.wrong
        else
            message = options[answer].explanation
        end

        -- Проверяем, должны ли неправильные ответы игнорироваться
        if isIgnoreErrorAnswer then
            return true, "[" .. messageType .. "]:" .. message
        end
    end

    return isCorrect, message
end