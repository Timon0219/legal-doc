export const CURRENT_ACTIVITY_STATUS = {
  DOCUMENT_UNDER_INITIAL_REVIEW: 0,
  FOLLOWED_UP: 1,
  ESCALATED: 2,
  SENT_ACROSS_EDIT_1: 3,
  SENT_ACROSS_EDIT_2: 4,
  SENT_ACROSS_EDIT_3: 5,
  EXECUTED: 6,
};

export const activityStatuses = [
  "document claimed",
  "received edits from counterparty",
  "sent edits to counterparty",
  "followed up with counterparty",
  "escalated to client",
  "accepted edits",
  "set for execution",
];

export const activityColor = {
  0: "#ffeba3",
  1: "#ffcdb1",
  2: "#bfe1f6",
  3: "#0952a7",
  4: "#e4cdef",
  5: "#572e83",
  6: "#d3ebb9",
};
export const activityColorText = {
  0: "#483922",
  1: "#783c05",
  2: "#135aac",
  3: "#cae9fa",
  4: "#5b3487",
  5: "#d8c1e8",
  6: "#d8c1e8",
};
