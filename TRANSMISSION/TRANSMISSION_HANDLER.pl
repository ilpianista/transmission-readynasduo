#!/usr/bin/perl
#-------------------------------------------------------------------------
#  Copyright 2007, NETGEAR
#  All rights reserved.
#-------------------------------------------------------------------------

do "/frontview/lib/cgi-lib.pl";
do "/frontview/lib/addon.pl";

# initialize the %in hash
%in = ();
ReadParse();

my $operation      = $in{OPERATION};
my $command        = $in{command};
my $enabled        = $in{"CHECKBOX_TRANSMISSION_ENABLED"};
my $data           = $in{"data"};

get_default_language_strings("TRANSMISSION");
 
my $xml_payload = "Content-type: text/xml; charset=utf-8\n\n"."<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
 
if( $operation eq "get" )
{
  $xml_payload .= Show_TRANSMISSION_xml();
}
elsif( $operation eq "set" )
{
  if( $command eq "RemoveAddOn" )
  {
    # Remove_Service_xml() removes this add-on
    $xml_payload .= Remove_Service_xml("TRANSMISSION", $data);
  }
  elsif ($command eq "ToggleService")
  {
    # Toggle_Service_xml() toggles the enabled state of the add-on
    $xml_payload .= Toggle_Service_xml("TRANSMISSION", $enabled);
  }
  elsif ($command eq "ModifyAddOnService")
  {
    # Modify_TRANSMISSION_xml() processes the input form changes
    $xml_payload .= Modify_TRANSMISSION_xml();
  }
}

print $xml_payload;


sub Show_TRANSMISSION_xml
{
  my $xml_payload = "<payload><content>" ;

  # check if service is running or not 
  my $enabled = GetServiceStatus("TRANSMISSION");

  # get TRANSMISSION_RPC_PORT parameter from /etc/default_services
  my $rpc_port = GetValueFromServiceFile("TRANSMISSION_RPC_PORT");

  if( $rpc_port eq "not_found" )
  {
    # set rpc_port to a default value
    $rpc_port = "9091";
  }

  my $enabled_disabled = "disabled";
     $enabled_disabled = "enabled" if( $enabled );

  # return run_time value for HTML
  $xml_payload .= "<TRANSMISSION_RPC_PORT><value>$rpc_port</value><enable>$enabled_disabled</enable></TRANSMISSION_RPC_PORT>"; 

  $xml_payload .= "</content><warning>No Warnings</warning><error>No Errors</error></payload>";
  
  return $xml_payload;
}


sub Modify_TRANSMISSION_xml 
{
  my $rpc_port  = $in{"TRANSMISSION_RPC_PORT"};
  my $SPOOL;
  my $xml_payload;
  
  $rpc_port = "9091" if( $rpc_port eq "" );

  $SPOOL .= "
if grep -q TRANSMISSION_RPC_PORT /etc/default/services; then
  sed -i 's/TRANSMISSION_RPC_PORT=.*/TRANSMISSION_RPC_PORT=${rpc_port}/' /etc/default/services
else
  echo 'TRANSMISSION_RPC_PORT=${run_time}' >> /etc/default/services
fi
";

  if( $in{SWITCH} eq "YES" ) 
  {
    $xml_payload = Toggle_Service_xml("TRANSMISSION", $enabled);
  }
  else
  {
    spool_file("${ORDER_SERVICE}_TRANSMISSION", $SPOOL);
    empty_spool();

    $xml_payload = _build_xml_set_payload_sync();
  }
  return $xml_payload;
}


1;
