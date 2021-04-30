self.TRANSMISSION_preaction = function()
{
}

self.TRANSMISSION_onloadaction = function()
{
}

self.TRANSMISSION_enable = function()
{
  document.getElementById('BUTTON_TRANSMISSION_APPLY').disabled = false;
  var rpcPort = document.getElementById('TRANSMISSION_RPC_PORT');
  if (rpcPort)
  {
    rpcPort.disabled = false;
  }
}

self.TRANSMISSION_remove = function()
{
  if( !confirm(S['CONFIRM_REMOVE_ADDON']) )
  {
    return;
  }
  
  var set_url;
  
  if ( confirm(S['CONFIRM_KEEP_ADDON_DATA']) )
  {
    set_url = NasState.otherAddOnHash['TRANSMISSION'].DisplayAtom.set_url
                + '?OPERATION=set&command=RemoveAddOn&data=preserve';
  }
  else
  {
    set_url = NasState.otherAddOnHash['TRANSMISSION'].DisplayAtom.set_url
                + '?OPERATION=set&command=RemoveAddOn&data=remove';
  }

  applyChangesAsynch(set_url,  TRANSMISSION_handle_remove_response);
}

self.TRANSMISSION_handle_remove_response = function()
{
  if ( httpAsyncRequestObject && 
      httpAsyncRequestObject.readyState && 
      httpAsyncRequestObject.readyState == 4 ) 
  {
    if ( httpAsyncRequestObject.responseText.indexOf('<payload>') != -1 )
    {
       showProgressBar('default');
       xmlPayLoad  = httpAsyncRequestObject.responseXML;
       var status = xmlPayLoad.getElementsByTagName('status').item(0);
       if (!status || !status.firstChild)
       {
          return;
       }

       if ( status.firstChild.data == 'success')
       {
         display_messages(xmlPayLoad);
         updateAddOn('TRANSMISSION');
         if (!NasState.otherAddOnHash['TRANSMISSION'])
         {
            remove_element('TRANSMISSION');
            if (getNumAddOns() == 0 )
            {
               document.getElementById('no_addons').className = 'visible';
            }
         }
         else
         {
           hide_element('TRANSMISSION_LINK');
         }
       }
       else if (status.firstChild.data == 'failure')
       {
         display_error_messages(xmlPayLoad);
       }
    }
    httpAsyncRequestObject = null;
  }
}

self.TRANSMISSION_page_change = function()
{
  var id_array = new Array( 'TRANSMISSION_RPC_PORT' );
  for (var ix = 0; ix < id_array.length; ix++ )
  {
     var field = NasState.otherAddOnHash['TRANSMISSION'].DisplayAtom.fieldHash[id_array[ix]]
     field.value = document.getElementById(id_array[ix]).value;
     field.modified = true;
  }
}

self.TRANSMISSION_enable_save_button = function()
{
  document.getElementById('BUTTON_TRANSMISSION_APPLY').disabled = false;
}

self.TRANSMISSION_apply = function()
{

   var page_changed = false;
   var set_url = NasState.otherAddOnHash['TRANSMISSION'].DisplayAtom.set_url;
   var rpcPort = document.getElementById('TRANSMISSION_RPC_PORT');
   if (rpcPort)
   {
     var id_array = new Array ('TRANSMISSION_RPC_PORT');
     for (var ix = 0; ix < id_array.length ; ix ++)
     {
       if (  NasState.otherAddOnHash['TRANSMISSION'].DisplayAtom.fieldHash[id_array[ix]].modified )
       {
          page_changed = true;
          break;
       }
     }
   }
   var enabled = document.getElementById('CHECKBOX_TRANSMISSION_ENABLED').checked ? 'checked' :  'unchecked';
   var current_status  = NasState.otherAddOnHash['TRANSMISSION'].Status;
   if ( page_changed )
   {
      set_url += '?command=ModifyAddOnService&OPERATION=set&' + 
                  NasState.otherAddOnHash['TRANSMISSION'].DisplayAtom.getApplicablePagePostStringNoQuest('modify') +
                  '&CHECKBOX_TRANSMISSION_ENABLED=' +  enabled;
      if ( enabled == 'checked' && current_status == 'on' ) 
      {
        set_url += "&SWITCH=NO";
      }
      else
      {
         set_url += "&SWITCH=YES";
      }
   }
   else
   {
      set_url += '?command=ToggleService&OPERATION=set&CHECKBOX_TRANSMISSION_ENABLED=' + enabled;
   }
   applyChangesAsynch(set_url, TRANSMISSION_handle_apply_response);
}

self.TRANSMISSION_handle_apply_response = function()
{
  if ( httpAsyncRequestObject &&
       httpAsyncRequestObject.readyState &&
       httpAsyncRequestObject.readyState == 4 )
  {
    if ( httpAsyncRequestObject.responseText.indexOf('<payload>') != -1 )
    {
      showProgressBar('default');
      xmlPayLoad = httpAsyncRequestObject.responseXML;
      var status = xmlPayLoad.getElementsByTagName('status').item(0);
      if ( !status || !status.firstChild )
      {
        return;
      }

      if ( status.firstChild.data == 'success' )
      {
        var log_alert_payload = xmlPayLoad.getElementsByTagName('normal_alerts').item(0);
        if ( log_alert_payload )
	{
	  var messages = grabMessagePayLoad(log_alert_payload);
	  if ( messages && messages.length > 0 )
	  {
	      if ( messages != 'NO_ALERTS' )
	      {
	        alert (messages);
	      }
	      var success_message_start = AS['SUCCESS_ADDON_START'];
		  success_message_start = success_message_start.replace('%ADDON_NAME%', NasState.otherAddOnHash['TRANSMISSION'].FriendlyName);
	      var success_message_stop  = AS['SUCCESS_ADDON_STOP'];
		  success_message_stop = success_message_stop.replace('%ADDON_NAME%', NasState.otherAddOnHash['TRANSMISSION'].FriendlyName);

	      if ( NasState.otherAddOnHash['TRANSMISSION'].Status == 'off' )
	      {
	        NasState.otherAddOnHash['TRANSMISSION'].Status = 'on';
	        NasState.otherAddOnHash['TRANSMISSION'].RunStatus = 'OK';
	        refresh_applicable_pages();
	      }
	      else
	      {
	        NasState.otherAddOnHash['TRANSMISSION'].Status = 'off';
	        NasState.otherAddOnHash['TRANSMISSION'].RunStatus = 'not_present';
	        refresh_applicable_pages();
	      }
	    }
        }
      }
      else if (status.firstChild.data == 'failure')
      {
        display_error_messages(xmlPayLoad);
      }
    }
    httpAsyncRequestObject = null;
  }
}

self.TRANSMISSION_handle_apply_toggle_response = function()
{
  if (httpAsyncRequestObject &&
      httpAsyncRequestObject.readyState &&
      httpAsyncRequestObject.readyState == 4 )
  {
    if ( httpAsyncRequestObject.responseText.indexOf('<payload>') != -1 )
    {
      showProgressBar('default');
      xmlPayLoad = httpAsyncRequestObject.responseXML;
      var status = xmlPayLoad.getElementsByTagName('status').item(0);
      if (!status || !status.firstChild)
      {
        return;
      }
      if ( status.firstChild.data == 'success' )
      {
        display_messages(xmlPayLoad);
      }
      else
      {
        display_error_messages(xmlPayLoad);
      }
    }
  }
}

self.TRANSMISSION_service_toggle = function()
{
  
  var addon_enabled = document.getElementById('CHECKBOX_TRANSMISSION_ENABLED').checked ? 'checked' :  'unchecked';
  var set_url    = NasState.otherAddOnHash['TRANSMISSION'].DisplayAtom.set_url
                   + '?OPERATION=set&command=ToggleService&CHECKBOX_TRANSMISSION_ENABLED='
                   + addon_enabled;
  
  var xmlSyncPayLoad = getXmlFromUrl(set_url);
  var syncStatus = xmlSyncPayLoad.getElementsByTagName('status').item(0);
  if (!syncStatus || !syncStatus.firstChild)
  {
     return ret_val;
  }

  if ( syncStatus.firstChild.data == 'success' )
  {
    display_messages(xmlSyncPayLoad);
    //if TRANSMISSION is enabled
    NasState.otherAddOnHash['TRANSMISSION'].Status = 'on';                                             
    NasState.otherAddOnHash['TRANSMISSION'].RunStatus = 'OK';                                            
    refresh_applicable_pages();  
    //else if TRANSMISSION is disabled
    NasState.otherAddOnHash['TRANSMISSION'].Status = 'off';                    
    NasState.otherAddOnHash['TRANSMISSION'].RunStatus = 'not_present';         
    refresh_applicable_pages(); 
  }
  else
  {
    display_error_messages(xmlSyncPayLoad);
  }
}

self.TRANSMISSION_showwebinterface = function()
{
   var WEBINTERFACE = 'http://' + parent.location.host + ':9091/TRANSMISSION/web';
   var rpcPort = document.getElementById('TRANSMISSION_RPC_PORT');
   if (rpcPort && rpcPort.value)
   {
     WEBINTERFACE = WEBINTERFACE.replace(':9091',':' + rpcPort.value)
   }
   var ReadyNASWebReference = window.open(WEBINTERFACE,"TRANSMISSION","left=100,screenX=200,resizable,scrollbars,status,toolbar");
}

