package com.telemedicine.patient.dto;

import com.telemedicine.patient.model.Address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {

    private String addressline1;
    private String addressline2;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    public Address toEntity() {
        Address address = new Address();
        address.setAddressLine1(addressline1);
        address.setAddressLine2(addressline2);
        address.setCity(this.city);
        address.setState(this.state);
        address.setZipCode(this.postalCode);
        address.setCountry(this.country);
        return address;
    }
}
