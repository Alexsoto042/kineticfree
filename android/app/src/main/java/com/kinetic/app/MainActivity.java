package com.kinetic.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Register custom Capacitor plugins
    registerPlugin(WidgetDataPlugin.class);
  }
  
  @Override
  public void onResume() {
    super.onResume();
    // Update widget when app comes to foreground
    StreakWidgetProvider.Companion.updateAllWidgets(this);
  }
}
