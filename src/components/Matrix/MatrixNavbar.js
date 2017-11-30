import React from 'react'
import { Image, Navbar } from 'react-bootstrap'
import elixirLogo from '../../images/elixir-logo.png'
import NavbarForm from '../Services/NavbarForm'
import { allowCollectionChange } from '../../common/helperFunctions'

const ServicesNavbar = () => (
  <Navbar collapseOnSelect bsStyle='default'>
    <Navbar.Header>
      <Navbar.Brand>
        <Image src={elixirLogo} responsive style={{ width: '112px', height: '73px', marginTop: '-10px', marginBottom: '-15px' }} />
      </Navbar.Brand>
      <Navbar.Toggle />
    </Navbar.Header>
    {allowCollectionChange &&
      <Navbar.Form pullRight>
        <NavbarForm />
      </Navbar.Form>
    }
  </Navbar>
)

export default ServicesNavbar