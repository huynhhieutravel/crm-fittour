import sys
content = open(sys.argv[1]).read()
print(content.count('{'))
print(content.count('}'))
