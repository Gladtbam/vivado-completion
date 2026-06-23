# dump_vivado_api.tcl
# 运行方式: vivado -mode batch -source dump_vivado_api.tcl

set output_file [open "vivado_api_schema.json" w]
puts $output_file "\["

# 获取当前环境下的所有指令，过滤掉一些内部隐藏指令
set all_cmds [lsort [info commands]]
set is_first 1

foreach cmd $all_cmds {
    # 尝试获取该指令的简短帮助描述
    if {[catch {set short_desc [help -short $cmd]} err]} {
        set short_desc ""
    }

    # 如果需要更精细的参数（比如以 - 开头的 flag），可以解析完整 help
    # 抓取指令名和描述
    if {$short_desc != ""} {
        # 处理转义字符，防止破坏 JSON 结构
        set safe_desc [string map {\" \\\" \n \\n} $short_desc]
        
        if {$is_first == 0} { puts $output_file "," }
        
        puts $output_file "  \{"
        puts $output_file "    \"command\": \"$cmd\","
        puts $output_file "    \"description\": \"$safe_desc\""
        puts $output_file "  \}"
        set is_first 0
    }
}

puts $output_file "\]"
close $output_file

puts "SUCCESS: vivado_api_schema.json has been generated."