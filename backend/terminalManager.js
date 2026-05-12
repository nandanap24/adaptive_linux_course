const { exec } = require("child_process");

const userContainers = {};
const userDirs = {};

function createContainer(userId) {
  return new Promise((resolve, reject) => {
    const containerName = `linux_user_${userId}`;

    // check if container already exists
    exec(
      `docker ps -a --filter "name=${containerName}" --format "{{.Names}}"`,
      (err, stdout) => {
        if (stdout.trim() === containerName) {
          userContainers[userId] = containerName;
          userDirs[userId] = "/root";
          // start container if stopped
          exec(`docker start ${containerName}`, () => {
            resolve(containerName);
          });

          return;
        }

        // create new container
        const cmd = `
          docker run -dit \
          --name ${containerName} \
          --memory=256m \
          --cpus=0.5 \
          --network=none \
          ubuntu bash
        `;

        exec(cmd, (err) => {
          if (err) {
            reject(err);
          } else {
            userContainers[userId] = containerName;
            userDirs[userId] = "/root";
            resolve(containerName);
          }
        });
      },
    );
  });
}

function runCommand(userId, command) {
  return new Promise((resolve, reject) => {
    let container = userContainers[userId];

    // reconnect container after backend restart
    if (!container) {
      container = `linux_user_${userId}`;

      userContainers[userId] = container;

      // start stopped container
      exec(`docker start ${container}`);
    }

    // initialize cwd if missing
    if (!userDirs[userId]) {
      userDirs[userId] = "/root";
    }

    // handle cd separately
    if (command.startsWith("cd ")) {
      const newDir = command.replace("cd ", "").trim();

      let targetDir = "";

      if (newDir === "..") {
        const parts = userDirs[userId].split("/").filter(Boolean);

        parts.pop();

        targetDir = "/" + parts.join("/");

        if (targetDir === "/") {
          targetDir = "/root";
        }
      } else if (newDir.startsWith("/")) {
        targetDir = newDir;
      } else {
        targetDir = `${userDirs[userId]}/${newDir}`;
      }

      exec(
        `docker exec ${container} bash -c "if [ -d '${targetDir}' ]; then echo exists; fi"`,
        (err, stdout) => {
          if (stdout.trim() === "exists") {
            userDirs[userId] = targetDir;

            resolve("");
          } else {
            resolve(`cd: no such file or directory: ${newDir}`);
          }
        },
      );

      return;
    }
    exec(`docker start ${container}`);
    const cmd = `docker exec ${container} bash -c "cd ${userDirs[userId]} && ${command}"`;

    console.log("RUNNING:", cmd);

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err);

        resolve(stderr?.trim() || err.message);
        return;
      }

      const output = stdout?.trim() || stderr?.trim() || "";

      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);

      resolve(output);
    });
  });
}

function removeContainer(userId) {
  return new Promise((resolve, reject) => {
    let container = userContainers[userId];

    if (!container) {
      container = `linux_user_${userId}`;

      userContainers[userId] = container;
    }

    if (!container) {
      resolve();
      return;
    }

    exec(`docker rm -f ${container}`, (err) => {
      if (err) reject(err);
      else {
        delete userContainers[userId];
        resolve();
      }
    });
  });
}

module.exports = {
  createContainer,
  runCommand,
  removeContainer,
  userDirs,
};
