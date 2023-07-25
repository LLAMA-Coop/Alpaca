// What the quiz displays depends on whether it is a client-checked or server-checked quiz component
// If client-checked, everything is rendered from the Quiz object
// If server-checked, only enough data for the prompt is displayed until the response is sent to the server
//  after which, the server provides the remaining data for the Quiz object
// Server-checked is for testing apps that want to prevent cheating

// sent into component via canClientCheck boolean