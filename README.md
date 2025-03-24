# adm-service

<div align="center">
  <h1><b>ADM-Service</b></h1>

  <p>A package that provides a set of functions to interact with the Web Services of the Italian Customs and Monopolies Agency (ADM)</p>
</div>

## Getting Started

This package is available in the npm registry.

```bash
pnpm install breeze
```
Next, configure the .env file (by following the example) and set the following variables:

<ul>
  <li><strong>VITE_MRN_IMPORT_TEST</strong>: the MRN of the import declaration to test </li>
  <li><strong>VITE_MRN_EXPORT_TEST</strong>: the MRN of the export declaration to test </li>
  <li><strong>VITE_DICHIARANTE_TEST</strong>: the VAT number of the delegate who owns the declarations.</li>
</ul>

You also need to configure the variables regarding:
<ul>
  <li> the ADM user for the RPA (Robot Process Automation)</li>
  <li> the Aruba Service for the signature of the xml</li>
</ul>

## Requirements

<ul>
  <li>
    <strong>Node.js >= 20.11.1</strong>: Ensure that you have Node.js version 14.x or higher installed on your system. 
    You can check your version by running:
    <pre><code>node -v</code></pre>
  </li>
  <li>
    <strong>Access to ADM digital services</strong>: You must have valid credentials (username and password) to access 
    the web services provided by the Italian Customs and Monopolies Agency (ADM).
  </li>
  <li>
    <strong>Digital signature certificate</strong>: A valid digital certificate is required to sign XML messages sent to 
    ADM services, ensuring data authenticity and integrity.
  </li>
    <li>
    <strong>Digital signature certificate</strong>: A valid digital certificate is required to sign XML messages sent to 
    ADM services. The package is configured to use Aruba services.
  </li>
</ul>