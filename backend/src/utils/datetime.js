export function dateSimplifier(obj) {
    // Helper function to format Date objects as "dd/mm/yyyy"
    const formatDate = (date) => {
      date = new Date(Date.parse(date));
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
  
    // Recursively iterate over object properties
    function simplifyDates(o) {
      for (const key in o) {
        if (key.toLowerCase().includes("date")) {
          // Convert Date to "dd/mm/yyyy" string
          o[key] = formatDate(o[key]);
        } else if (typeof o[key] === 'object' && o[key] !== null) {
          // Recursively simplify nested objects
          simplifyDates(o[key]);
        }
      }
    }
  
    // Clone the original object to avoid mutating it directly
    const clonedObj = JSON.parse(JSON.stringify(obj));
    simplifyDates(clonedObj);
    return clonedObj;
  }

export function AsianTimeParse(timestr) {
  const [day , month , year] = timestr.split("/");
  return new Date(`${year}-${month}-${day}`);
}