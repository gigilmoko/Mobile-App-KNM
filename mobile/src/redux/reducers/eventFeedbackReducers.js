const initialState = {
    eventFeedback: [],  // Change from 'null' to an empty array to hold multiple feedback entries
    loading: false,
    error: null,
  };
  
  // Reducer to handle event feedback actions
  export const eventFeedbackReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'submitEventFeedbackRequest':
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case 'submitEventFeedbackSuccess':
        return {
          ...state,
          loading: false,
          eventFeedback: [...state.eventFeedback, action.payload], // Append new feedback to existing list
          error: null,
        };
  
      case 'submitEventFeedbackFail':
        return {
          ...state,
          loading: false,
          eventFeedback: [], // Reset feedback in case of failure
          error: action.payload, // Store the error message
        };
  
      case 'fetchEventFeedbackRequest':
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case 'fetchEventFeedbackSuccess':
        return {
          ...state,
          loading: false,
          eventFeedback: action.payload, // Replace feedback with fetched data
          error: null,
        };
  
      case 'fetchEventFeedbackFail':
        return {
          ...state,
          loading: false,
          eventFeedback: [], // Reset feedback in case of failure
          error: action.payload,
        };
  
      default:
        return state;
    }
  };