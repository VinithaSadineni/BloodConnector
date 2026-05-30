/**
 * Checks if a donor is eligible to donate based on their last donation date.
 * A donor is eligible if they have never donated, or if their last donation was at least 56 days ago.
 * @param {Date|string|null|undefined} lastDonationDate 
 * @returns {boolean}
 */
const checkEligibility = (lastDonationDate) => {
  if (!lastDonationDate) {
    return true;
  }

  const lastDate = new Date(lastDonationDate);
  if (isNaN(lastDate.getTime())) {
    // If invalid date is provided, default to true
    return true;
  }

  const today = new Date();
  
  // Calculate difference in milliseconds
  const diffTime = Math.abs(today - lastDate);
  
  // Convert difference to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If the last donation date is in the future (invalid state), return true or handle accordingly
  if (today < lastDate) {
    return false;
  }

  return diffDays >= 56;
};

module.exports = checkEligibility;
