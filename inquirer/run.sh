rm -rf /tmp/.X99-lock
Xvfb :99 -nolisten tcp &
cd /opt/app/inquirer && npm run start