@echo off
echo Setting up admin user for Household Planet Kenya...
echo.

cd household-planet-backend
node create-admin.js

echo.
echo Admin setup complete!
echo.
echo Login at: http://localhost:3000/login
echo Email: admin@householdplanet.co.ke
echo Password: HouseholdAdmin2024!
echo.
echo IMPORTANT: Change the password after first login!
pause