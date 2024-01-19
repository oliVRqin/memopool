// Converts the date string to a more readable format
export function formatDateWithTime(dateString: string) {
    var date = new Date(dateString);

    var year = date.getFullYear();
    var month = date.toLocaleString('default', { month: 'long' });
    var day = date.getDate();

    var hour = date.getHours();
    var period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; 

    var minutes = date.getMinutes().toString();
    minutes = parseInt(minutes) < 10 ? '0' + minutes.toString() : minutes.toString();

    var formattedTime = month + ' ' + day + ', ' + year + ' — ' + hour + ':' + minutes + ' ' + period;

    return formattedTime;
}
