# WeatherXM Explorer

The WeatherXM Explorer project implements a top view of the WeatherXM network.

We use **[GitHub Flow](https://githubflow.github.io/)** as our branching model.

# Environment Setup

All contributors could use any IDE platform or code editor they want as long as they use the appropriate linter ([eslint](https://eslint.org)) and code formatter ([prettier](https://prettier.io)) as their config files exist inside the project's root folder.

# Building

To build the app from source, you need to create a `.env` file in the root directory, according to the `.env.template` and make sure to fill in all the required variables. Then, install all the required dependencies by running one of the following commands:

#### npm

```bash
npm install
```

#### yarn

```bash
yarn install
```

After the above steps, you could start the development server on `http://localhost:3001` by running one of the following commands:

#### npm

```bash
npm run dev
```

#### yarn

```bash
yarn dev
```

If you want to customize the `port` and `address` of dev server, just change the dev server settings in the `nuxt.confing.ts` file.

> [!IMPORTANT]
> Be aware that the use of FontAwesome Pro icons requires a valid Font Awesome Pro license. Font Awesome Pro is a premium icon set that provides additional features and icons beyond the free version. However, if you do not own a Font Awesome Pro license, feel free to replace the icons with those from an alternative font package or your custom icons.

# GitHub Actions

We have 3 different [GitHub Actions](https://github.com/features/actions):

1. **Deploy on Dev:** An action that runs by hand every time a dev version needs to be tested internally, building the app using dev ENV vars and docker-compose script, in order to dockerize the app and make sure all the dependencies are met.
2. **Flow for PRs on develop and main for `wxm-explorer`:** An action that runs on **every push on** `feature branch`, building the app using the dev ENV vars and the `Dockerfile` script, in order to dockerize the app on the dev cluster and make sure all the dependencies are met.
3. **Flow for creating a release of `wxm-explorer`:** An action that runs on **every tag pushed,** building the
   app production ENV vars, and the `Dockerfile` script in order to dockerize the app on the prod cluster and make sure all the dependencies are met.

# Different Flavors

We have 3 different app flavors (consider flavors as different “build variants”). For each flavor a
different `.env` file can be created for different environment variables, such as `API_URL`.

The 3 different app flavors are:

1. **Remote Mock:** This flavor communicates with our **remote mock API**.
   **Currently only for internal use.**

2. **Remote Dev**: This flavor communicates with our **dev API**.
   **Currently only for internal use.**

3. **Remote Prod:** This flavor communicates with our **production API**, found
   on `app.weatherxm.com`. The `API_URL` on that environment file should
   be [https://api.weatherxm.com](https://api.weatherxm.com)

# How to merge `feature/` in Git?

When merging a `feature/` PR on Git, we do `squash merge` with an explanatory and human-friendly
commit message.

# Internal Testing Releases

Our only (for now) internal channel to distribute our app to the team in order to test it is by
deploying it on the dev machine. Different `Remote` flavors are
supported.

In order to upload a version up for testing, one way can be used:

1. Using a GitHub Action to automatically build, upload and distribute the app through the dev machine.

# Production Releases (How To)

In order to create a new production release some mandatory steps should be followed that we will
explain below:

1. Create and push a new commit in `main` bumping the `version` in `package.json` file.
2. `git checkout main` and create a commit tag with the title being the version name (`X.X.X`).
3. Push the tag, this will trigger the **Flow for creating a release of wxm-explorer** action to run.

<h3 align="left">Languages and Tools:</h3>
<p align="left">
    <a href="https://www.typescriptlang.org" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/typescript/typescript.png" alt="ts" width="40" height="40"
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> 
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/></a>
    <a href="https://nuxt.com" target="_blank" rel="noreferrer">
    <img src="https://avatars.githubusercontent.com/u/23360933?s=48&v=4" alt="nuxtjs" width="40" height="40"/></a>
    <a href="https://vuejs.org/" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vuejs/vuejs-original-wordmark.svg" alt="vuejs" width="40" height="40"/></a>
    <a href="https://vuetifyjs.com/en/" target="_blank" rel="noreferrer"> <img src="https://bestofjs.org/logos/vuetify.svg" alt="vuetify" width="40" height="40"/></a>
    <a href="https://www.docker.com/" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original-wordmark.svg" alt="docker" width="40" height="40"/></a>
    </p>
