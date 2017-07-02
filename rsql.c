#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
	char cmd[1000];
	for (int i=0; i<argc; i++) {
		if (i>0) printf("\n========================\n");
		printf("%d===>%s\n", i, argv[i]);

		if (i>0) {
			snprintf(cmd, sizeof cmd, "ls -l %s|head -n 3", argv[i]);
			snprintf(cmd, sizeof cmd, "nodejs taes.js query_id %s --key=key_value", argv[i]);
			printf("cmd=>%s\n========================\n",cmd);
			system(cmd);
		}
	}
}
