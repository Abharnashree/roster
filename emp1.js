<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Schedule</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }

        .grid-container {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 10px;
        }

        .grid-button {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: center;
            cursor: pointer;
            width: 100%;
        }

        .dropdown {
            display: none;
            position: absolute;
            background-color: #f9f9f9;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            z-index: 1;
        }

        .dropdown-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .dropdown-option {
            padding: 10px;
            cursor: pointer;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        #names,
        #tableContainer {
            margin-top: 20px;
        }

        button {
            margin-top: 20px;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        }
    </style>

    <script>
        const selectedValues = {};
        async function showDropdown(event, day, timeOfDay) {
    event.stopPropagation();
    const dropdown = document.getElementById('dropdown');
    const timeDropdown = document.getElementById('timeDropdown');

    dropdown.style.display = 'block';
    dropdown.style.left = `${event.currentTarget.offsetLeft}px`;
    dropdown.style.top = `${event.currentTarget.offsetTop + event.currentTarget.offsetHeight}px`;

    try {
        const response = await fetch('http://localhost:5000/employee');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const allEmployees = await response.json();

        timeDropdown.innerHTML = allEmployees.map(name => `
            <div class="dropdown-option" onclick="showNames('${day}', '${timeOfDay}', '${name}')">${name}</div>
        `).join('');
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        timeDropdown.innerHTML = '<p>Error fetching data</p>';
    }
}



        function showNames(day, timeOfDay, name) {
            const namesContainer = document.getElementById('names');
            namesContainer.innerHTML = `<h3>Name: ${name} (Day: ${day}, Time: ${timeOfDay})</h3>`;

            selectedValues[`${day}_${timeOfDay}`] = name;

            const dropdown = document.getElementById('dropdown');
            dropdown.style.display = 'none';

            displaySelectedValues();
        }

        function displaySelectedValues() {
            const tableContainer = document.getElementById('tableContainer');
            tableContainer.innerHTML = '';

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['Day', 'Time of Day', 'Selected Name'];

            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.appendChild(document.createTextNode(headerText));
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');

            for (const key in selectedValues) {
                const [day, timeOfDay] = key.split('_');
                const selectedName = selectedValues[key];

                const row = document.createElement('tr');
                const cell1 = document.createElement('td');
                cell1.appendChild(document.createTextNode(day));
                row.appendChild(cell1);

                const cell2 = document.createElement('td');
                cell2.appendChild(document.createTextNode(timeOfDay));
                row.appendChild(cell2);

                const cell3 = document.createElement('td');
                cell3.appendChild(document.createTextNode(selectedName));
                row.appendChild(cell3);

                tbody.appendChild(row);
            }

            table.appendChild(tbody);
            tableContainer.appendChild(table);
        }

        function submitSelection() {
            const schedule = Object.entries(selectedValues).map(([key, selectedName]) => {
                const [day, timeOfDay] = key.split('_');
                return { day, timeOfDay, selectedName };
            });

            fetch('/submitSchedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ schedule }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(message => {
                console.log(message);
            })
            .catch(error => {
                console.error('Error submitting schedule:', error);
            });
        }

        window.onclick = function () {
            const dropdown = document.getElementById('dropdown');
            dropdown.style.display = 'none';
        }
    </script>
</head>
<body>
    <div class="grid-container">
       
    <!-- Monday -->
    <div class="grid-button" onclick="showDropdown(event, 'Monday', 'morning')">Monday - Morning</div>
    <div class="grid-button" onclick="showDropdown(event, 'Monday', 'evening')">Monday - Evening</div>
    <div class="grid-button" onclick="showDropdown(event, 'Monday', 'night')">Monday - Night</div>

    <!-- Tuesday -->
    <div class="grid-button" onclick="showDropdown(event, 'Tuesday', 'morning')">Tuesday - Morning</div>
    <div class="grid-button" onclick="showDropdown(event, 'Tuesday', 'evening')">Tuesday - Evening</div>
    <div class="grid-button" onclick="showDropdown(event, 'Tuesday', 'night')">Tuesday - Night</div>

    <!-- Wednesday -->
    <div class="grid-button" onclick="showDropdown(event, 'Wednesday', 'morning')">Wednesday - Morning</div>
    <div class="grid-button" onclick="showDropdown(event, 'Wednesday', 'evening')">Wednesday - Evening</div>
    <div class="grid-button" onclick="showDropdown(event, 'Wednesday', 'night')">Wednesday - Night</div>

    <!-- Thursday -->
    <div class="grid-button" onclick="showDropdown(event, 'Thursday', 'morning')">Thursday - Morning</div>
    <div class="grid-button" onclick="showDropdown(event, 'Thursday', 'evening')">Thursday - Evening</div>
    <div class="grid-button" onclick="showDropdown(event, 'Thursday', 'night')">Thursday - Night</div>

    <!-- Friday -->
    <div class="grid-button" onclick="showDropdown(event, 'Friday', 'morning')">Friday - Morning</div>
    <div class="grid-button" onclick="showDropdown(event, 'Friday', 'evening')">Friday - Evening</div>
    <div class="grid-button" onclick="showDropdown(event, 'Friday', 'night')">Friday - Night</div>

    <!-- Saturday -->
    <div class="grid-button" onclick="showDropdown(event, 'Saturday', 'morning')">Saturday - Morning</div>
    <div class="grid-button" onclick="showDropdown(event, 'Saturday', 'evening')">Saturday - Evening</div>
    <div class="grid-button" onclick="showDropdown(event, 'Saturday', 'night')">Saturday - Night</div>

    <!-- Sunday -->
    <div class="grid-button" onclick="showDropdown(event, 'Sunday', 'morning')">Sunday - Morning</div>
    <div class="grid-button" onclick="showDropdown(event, 'Sunday', 'evening')">Sunday - Evening</div>
    <div class="grid-button" onclick="showDropdown(event, 'Sunday', 'night')">Sunday - Night</div>
</div>

    </div>

    <div id="dropdown" class="dropdown" onclick="event.stopPropagation();">
        <div class="dropdown-content" id="timeDropdown">
            <!-- Dropdown options will be dynamically added here -->
        </div>
    </div>

    <div id="names"></div>

    <div id="tableContainer"></div>

    <button onclick="submitSelection()">Submit</button>
</body>
</html>