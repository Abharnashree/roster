document.addEventListener("DOMContentLoaded", () => {
  // Fetch user data when the page loads
  fetchUserData();

  function fetchUserData() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");

    fetch(`/getUserData?username=${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Update UI with user name
        document.getElementById("userName").textContent = data.name;

        // Update UI with user schedule
        displayUserSchedule(data.schedule);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }

  function displayUserSchedule(schedule) {
    const scheduleContainer = document.getElementById("scheduleContainer");

    if (schedule.length === 0) {
      scheduleContainer.innerHTML = "<p>No schedule available.</p>";
      return;
    }

    // Create a table to display the schedule
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["Day", "Time of Day", "Selected Name"];

    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.appendChild(document.createTextNode(headerText));
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    schedule.forEach((entry) => {
      const row = document.createElement("tr");
      const cell1 = document.createElement("td");
      cell1.appendChild(document.createTextNode(entry.day));
      row.appendChild(cell1);

      const cell2 = document.createElement("td");
      cell2.appendChild(document.createTextNode(entry.time_of_day));
      row.appendChild(cell2);

      const cell3 = document.createElement("td");
      cell3.appendChild(document.createTextNode(entry.selected_name));
      row.appendChild(cell3);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    scheduleContainer.appendChild(table);
  }
});
