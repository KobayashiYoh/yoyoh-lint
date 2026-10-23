import 'package:analysis_server_plugin/plugin.dart';
import 'package:analysis_server_plugin/registry.dart';

final plugin = YoyohLintPlugin();

class YoyohLintPlugin extends Plugin {
  @override
  String get name => 'yoyoh_lint';

  @override
  void register(PluginRegistry registry) {}
}
