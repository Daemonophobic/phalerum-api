# Phalerum API

This codebase contains the implementation of the Phalerum API.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

## Installation

To install and set up the project, follow these steps:

1. Clone the repository.
2. Install the required dependencies by running `npm install`.
3. Configure the environment variables.
    - The ENC_KEY should be 32 random bytes in hexadecimal format (`64 * [a-z0-9]`).
        - `node -p "crypto.randomBytes(32).toString('hex')"`
4. Generate an rsa keypair for JWT signing.
    - Run `mkdir certificates`
    - Run `openssl genrsa -out certificates/key.pem 4096`
    - Run `openssl rsa -in certificates/key.pem -outform PEM -pubout -out certificates/public.pem`
5. Seed the database by running `npm run prepare-database`.
6. Build the source code by running `npm run build`
6. Run the server by running `npm start`.

### Development
Run `npm run dev` to run the API in JIT development mode.

## Usage

To use the API, follow these guidelines:

1. Make HTTP requests to the appropriate endpoints.
2. Include the required headers and parameters.
3. Refer to the API documentation for detailed information on each endpoint.

## Contributing

Contributions to this project are welcome. To contribute, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Submit a pull request. 