global debug
debug = obs.obs_properties_get(props, "debug")

if prop_name == "source":
    populate_list_property_with_source_names(prop)
    if source_type in SOURCES.monitor.all_sources() or darwin:
        obs.obs_property_set_visible(monitor_override, True)
        obs.obs_property_set_visible(refresh_monitor, True)
        obs.obs_property_set_visible(monitor_size_override, True)
        zoom.update_source_size()
    else:
        obs.obs_property_set_visible(monitor_override, False)
        obs.obs_property_set_visible(refresh_monitor, False)
        obs.obs_property_set_visible(monitor_size_override, False)
elif prop_name == "Refresh monitors":
    populate_list_property_with_monitors(prop)

obs.obs_property_set_visible( 