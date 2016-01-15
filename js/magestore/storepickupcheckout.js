document.observe('dom:loaded', function() {
    new PeriodicalExecuter(function() {
        if (!$('select_store_pickup') && googleMap.listStore.length) {
            if ($('s_method_storepickup_storepickup')) {
                $('s_method_storepickup_storepickup').up('li').insert({
                    bottom: new Element('div', {
                        id: 'selected_st_select_box'
                    })
                });
                addStoreSelectBox($('selected_st_select_box'));
                addStoreOpenPopupButton($('selected_st_select_box'));
                $('s_method_storepickup_storepickup').up('li').insert({
                    bottom: new Element('div', {
                        id: 'selected_st_info'
                    })
                });
                googleMap.listStore.each(function(el) {
                    if (el.store_id == storeDefault) {
                        googleMap.currentSystemValues.store = el;
                        throw $break;
                    }
                });
                applyStoreToCheckout();
            }
        } else {
            if ($('s_method_storepickup_storepickup')) {
                if ($('s_method_storepickup_storepickup').checked) {
                    if ($('select_store_pickup'))
                        $('select_store_pickup').show();
                    if ($('select_box_store_pickup'))
                        $('select_box_store_pickup').show();
                    if ($('select_box_label'))
                        $('select_box_label').show();
                    if ($('selected_st_info'))
                        $('selected_st_info').show();

                } else {
                    if ($('select_store_pickup'))
                        $('select_store_pickup').hide();
                    if ($('select_box_store_pickup'))
                        $('select_box_store_pickup').hide();
                    if ($('select_box_label'))
                        $('select_box_label').hide();
                    if ($('selected_st_info'))
                        $('selected_st_info').hide();
                }
            }
        }
    }, 1);
});

document.observe("dom:loaded", function() {
    $('apply_store').observe('click', applyStoreToCheckout);
    $('cancel_store').observe('click', cancelStoreCheckout);
    $('apply_store1').observe('click', applyStoreToCheckout);
    $('cancel_store1').observe('click', cancelStoreCheckout);
});

function addStoreOpenPopupButton(el) {
    el.insert({
        bottom: new Element('a', {
            id: 'select_store_pickup',
            href: 'javascript:openStorepickupMap();'
        }).update("Select store by map")
    });
}

function addStoreSelectBox(el) {
    if ($('select_box_store_pickup'))
        return;
    el.insert({
        bottom: new Element('label', {
            id: 'select_box_label',
            class: 'required'
        }).update('Select store:')
    });
    el.insert({
        bottom: new Element('select', {
            id: 'select_box_store_pickup',
            onchange: 'changeStoreSelect(this);',
            class: 'required-entry validate-select validation-passed'
        })
    });
    $('select_box_store_pickup').insert({
        bottom: new Element('option', {
            value: ''
        }).update("Select a store to pickup.")
    });
    googleMap.listStore.each(function(el) {
        $('select_box_store_pickup').insert({
            bottom: new Element('option', {
                value: el.store_id
            }).update(el.store_name)
        });
    });
    if (googleMap.currentSystemValues.store)
        $('select_box_store_pickup').value = googleMap.currentSystemValues.store.store_id;
}


function cancelStoreCheckout() {
    if ($('popup'))
        $('popup').hide();
    if ($('black_background'))
        $('black_background').hide();
}

function changeStoreSelect(element) {
    if (!element.value) {
        googleMap.currentSystemValues.store = null;
    } else
        googleMap.listStore.each(function(el) {
            if (el.store_id == element.value) {
                googleMap.refreshAllMaker();
                googleMap.currentSystemValues.store = el;
                throw $break;
            }
        });
    applyStoreToCheckout();
}

function applyStoreToCheckout() {
    if ($('popup_outer').getStyle("display") !== "none" && !googleMap.currentSystemValues.store) {
        if (confirm('You have to choose a store before applying')) {
            return;
        }
    } else {
        //console.info('dfdfd');
    }
    if ($('selected_st_info'))
        $('selected_st_info').innerHTML = '';
    if ($('popup_outer'))
        $('popup_outer').hide();

    if (googleMap.currentSystemValues.store) {
        new Ajax.Request(changeStoreUrl, {
            method: 'post',
            parameters: {
                store_id: googleMap.currentSystemValues.store.store_id
            },
            onComplete: function(xhr) {
                if (xhr.responseText.isJSON()) {
                    var price = xhr.responseText.evalJSON().shippingPrice;
                    updateStoreShippingPrice(price);
                }
            }
        });
        storeDefault = googleMap.currentSystemValues.store.store_id;
        $('select_box_store_pickup').value = googleMap.currentSystemValues.store.store_id;
        $('selected_st_info').insert({
            bottom: '<div class="title store-address">' + '<h3>' + googleMap.currentSystemValues.store.store_name + '</h3><span class="store-address-info">' + googleMap.currentSystemValues.store.address + ', &nbsp' + googleMap.currentSystemValues.store.city + ', &nbsp' + googleMap.currentSystemValues.store.country_name + '</span>' + '</div>'
        });
        $('selected_st_info').insert({
            bottom: new Element('div', {
                id: 'store_date_time_box'
            })
        });
        if (pickupDateTime) {
            $('store_date_time_box').insert({
                bottom: shipping_date_div
            });
            $('store_date_time_box').insert({
                bottom: time_box
            });
            if ($('shipping_time'))
                $('shipping_time').observe('change', updateShippingTime);

            if ($$('#shipping_date_div .ajax-loading-wait').first()) {
                $$('#shipping_date_div .ajax-loading-wait').first().show();
            } else {
                $('shipping_date').insert({
                    after: ajax_loading_wait
                });
            }

            $('shipping_date').disabled = true;

            new Ajax.Request(disableDateUrl, {
                method: 'post',
                parameters: {
                    store_id: googleMap.currentSystemValues.store.store_id
                },
                onSuccess: setupCalendar
            });
        }
        return;
    }
    new Ajax.Request(changeStoreUrl, {
        method: 'post',
        parameters: {
            store_id: 0
        },
        onComplete: function(xhr) {
            updateStoreShippingPrice('');
        }
    });
    $('select_box_store_pickup').value = '';
}

function updateStoreShippingPrice(price) {
    var s_method = 's_method_storepickup_storepickup';
    if ($(s_method) && $(s_method).up('li') && $(s_method).up('li').down('.price')) {
        $(s_method).up('li').down('.price').update(price);
    }
    if (typeof awOSCShipment != "undefined") {
        awOSCShipment.switchToMethod();
    }
    if (typeof updateShippingMethod != "undefined") {
        updateShippingMethod();
    }
    $('s_method_storepickup_storepickup').click();
}

function setupCalendar(transport) {
    $$('#shipping_date_div .ajax-loading-wait').invoke('hide');
    $('shipping_date').disabled = false;
    var response = JSON.parse(transport.responseText);
    if ($('shipping_date'))
        Calendar.setup({
            inputField: "shipping_date",
            ifFormat: calendarDateFormat,
            showsTime: false,
            electric: false,
            button: "shipping_date",
            singleClick: true,
            disableFunc: function(date) {
                var today = new Date();

                if (date.getFullYear() < today.getFullYear()) {
                    return true;
                } else if (date.getMonth() < today.getMonth() && date.getFullYear() <= today.getFullYear()) {
                    return true;
                } else if (date.getDate() < today.getDate() && date.getMonth() <= today.getMonth() && date.getFullYear() <= today.getFullYear()) {
                    return true;
                }

                if (response.specialdate != null)
                    if (response.specialdate.indexOf(parseFloat(date.print("%Y%m%d"))) !== -1) {
                        return false;
                    }
                if (response.holidaydate != null)
                    if (response.holidaydate.indexOf(parseFloat(date.print("%Y%m%d"))) !== -1) {
                        return 'holiday';
                    }


                if (today.getDate() == date.getDate()) {
                    return false;
                }
                for (i = 0; i < parseFloat(response.closed.length); i++) {
                    if (response.closed[i] == date.getDay()) {
                        return true;
                    }
                }
            },
            onUpdate: function() {
                if ('time-box')
                    $('time-box').show();

                if ($$('#time-box .ajax-loading-wait').first()) {
                    $$('#time-box .ajax-loading-wait').first().show();
                } else {
                    $('shipping_time').insert({
                        after: ajax_loading_wait
                    });
                }

                $('shipping_time').disabled = true;
                new Ajax.Request(selectTimeUrl, {
                    method: 'post',
                    parameters: {
                        shipping_date: $F('shipping_date'),
                        store_id: googleMap.currentSystemValues.store.store_id
                    },
                    onSuccess: setupTimeBox
                });
            }
        });
    if ($('shipping_date'))
        $('shipping_date').show();
    if ($('date-please-wait'))
        $('date-please-wait').hide();
}

function updateShippingTime() {
    new Ajax.Request(changeTimeUrl, {
        method: 'post',
        parameters: {
            shipping_time: $F('shipping_time')
        },
    });
}

function setupTimeBox(transport) {
    try {
        $$('#time-box .ajax-loading-wait').invoke('hide');
        $('shipping_time').disabled = false;
        alert(JSON.parse(transport.responseText).message);
        $('shipping_date').value = '';
        $('time-box').hide();
        return;
    } catch (e) {
        $('shipping_time').innerHTML = transport.responseText;
        if ('time-box')
            $('time-box').show();
    }
}

function openStorepickupMap() {
    if ($('popup_outer'))
        $('popup_outer').show();
    if ($('popup'))
        $('popup').show();
    if ($('black_background'))
        $('black_background').show();
    if ($('selected_store'))
        $('selected_store').hide();
    googleMap.mapTriggerResize();
    googleMap.selectStoreCheckout();

    googleMap.map.fitBounds(googleMap.bounds);

    // var currentstore = googleMap.getCurrentStore();
    // googleMap.refreshAllMaker();
    // googleMap.setCurentStore(currentstore);
    if (googleMap.getCurrentStore()) {
        // google.maps.event.trigger(googleMap.getCurrentStore().getStoreDom(), 'click');
        // googleMap.getCurrentStore().getStoreDom().click();
        googleMap.map.setZoom(googleMap.getCurrentStore().getZoomLevel());
        googleMap.map.panTo(googleMap.getCurrentStore().getMarker().getPosition());
        google.maps.event.trigger(googleMap.getCurrentStore().getMarker(), 'click');
    }
}
