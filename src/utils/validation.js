/**
 * Utility functions for input validation
 */

export function validateCompanyName(companyName) {
    if (!companyName) {
        throw new Error('Company name is required');
    }
    
    if (typeof companyName !== 'string') {
        throw new Error('Company name must be a string');
    }
    
    if (companyName.trim().length === 0) {
        throw new Error('Company name cannot be empty');
    }

    // Remove special characters and excessive spaces
    companyName = companyName.trim().replace(/[^\w\s.-]/g, '');
    
    return companyName;
}

export function validateLead(lead) {
    if (!lead) {
        throw new Error('Lead data is required');
    }

    // Required fields that must be present
    const requiredFields = [
        'company',
        'description',
        'industry'
    ];

    // Optional fields with default values
    const optionalFields = {
        'website': (company) => `${company.toLowerCase().replace(/\s+/g, '-')}.com`,
        'size': 'Unknown',
        'market': 'B2B',
        'type': 'Technology'
    };

    // Check required fields
    for (const field of requiredFields) {
        if (!lead[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Set default values for missing optional fields
    for (const [field, defaultValue] of Object.entries(optionalFields)) {
        if (!lead[field]) {
            lead[field] = typeof defaultValue === 'function' ? defaultValue(lead.company) : defaultValue;
        }
    }

    // Validate contact person
    if (!lead.contactPerson) {
        throw new Error('Contact person information is required');
    }

    const requiredContactFields = ['name', 'title'];
    const optionalContactFields = {
        'email': (name) => `${name.toLowerCase().replace(/\s+/g, '.')}@${lead.website}`,
        'department': 'Executive'
    };

    // Check required contact fields
    for (const field of requiredContactFields) {
        if (!lead.contactPerson[field]) {
            throw new Error(`Missing required contact person field: ${field}`);
        }
    }

    // Set default values for missing optional contact fields
    for (const [field, defaultValue] of Object.entries(optionalContactFields)) {
        if (!lead.contactPerson[field]) {
            lead.contactPerson[field] = typeof defaultValue === 'function' 
                ? defaultValue(lead.contactPerson.name) 
                : defaultValue;
        }
    }

    return true;
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }
    return true;
}
